/**
 * @file abilities.ts
 * @description Centralized CASL (access control) configuration for defining user abilities and permissions
 * across the application. This file defines the rules that determine what actions a user can perform
 * on different subjects (models) based on their role.
 */

import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  MongoAbility,
} from '@casl/ability';
import { UserRole } from '../modules/shared/enums/role.enum';
import { IArticle, IComment, IReply, IUser } from '../modules/shared';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Supported actions that can be performed by users.
 */
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';

/**
 * Supported subject names that map to application models.
 */
export type SubjectTypeName = 'Article' | 'Comment' | 'User' | 'Reply' | 'all';

/**
 * Union type for all model interfaces used as permission subjects.
 */
export type ModelType = IArticle | IComment | IUser | IReply;

/**
 * Combined subject types accepted by CASL — either a model name or an actual model instance.
 */
export type SubjectTypes = SubjectTypeName | ModelType;

/**
 * CASL ability type used throughout the app.
 */
export type AppAbility = MongoAbility<[Actions, SubjectTypes]>;

/**
 * Determines the subject type (model name) for a given model instance or string.
 *
 * @param item - The model instance or string representing a subject.
 * @returns The extracted subject type (e.g., `'Article'`, `'User'`, `'all'`).
 */
function getModelName(item: ModelType): ExtractSubjectType<SubjectTypes> {
  if (!item) return 'all';

  if (typeof item === 'string') return item;

  if (item.baseModelName) return item.baseModelName as ExtractSubjectType<SubjectTypes>;

  return 'all';
}

/**
 * Defines the abilities (permissions) for a specific user based on their assigned role.
 *
 * @param user - The user whose abilities are being defined.
 * @returns A CASL `AppAbility` instance containing the user's permissions.
 *
 * @example
 * ```ts
 * const userAbility = defineAbilitiesFor(currentUser);
 * if (userAbility.can('delete', 'Article')) {
 *   // Allow deletion
 * }
 * ```
 */
export function defineAbilitiesFor(user: IUser): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  /** Default guest permissions */
  can('read', 'Article');
  can('read', 'Comment');
  can('create', 'Comment');
  can('create', 'Reply');

  /** Writer-specific permissions */
  if (user.role === UserRole.WRITER) {
    can('create', 'Article');
    can('update', 'Article', { userId: user._id });
    can('delete', 'Article', { userId: user._id });
    can('create', 'Comment');
    can('update', 'Comment', { userId: user._id });
    can('delete', 'Comment', { userId: user._id });
  }

  /** Editor permissions */
  if (user.role === UserRole.EDITOR) {
    can('manage', 'Article');
    can('manage', 'Comment');
    cannot('delete', 'User');
  }

  /** Admin permissions (full access) */
  if (user.role === UserRole.ADMIN) {
    can('manage', 'all');
  }

  /** Build and return the CASL ability */
  return build({
    detectSubjectType: (subject): ExtractSubjectType<SubjectTypes> => {
      if (subject.baseModelName === 'all') return 'all';
      const modelName = getModelName(subject);
      return modelName || (subject.constructor?.name as ExtractSubjectType<SubjectTypes>) || 'all';
    },
  });
}

/**
 * Creates a CASL ability instance for a given user.
 *
 * @param user - The user whose ability should be generated.
 * @returns The constructed `AppAbility` instance.
 *
 * @example
 * ```ts
 * const ability = createAbilityForUser(user);
 * if (ability.can('update', 'Article')) {
 *   // Allow edit
 * }
 * ```
 */
export function createAbilityForUser(user: IUser): AppAbility {
  return defineAbilitiesFor(user);
}

/**
 * Determines whether a user can perform a given action on a subject.
 *
 * @param user - The user whose permissions are being evaluated.
 * @param action - The action to check (e.g., `'create'`, `'delete'`).
 * @param subject - The subject (model or string) to act upon.
 * @param field - Optional specific field within the subject.
 * @returns `true` if the user can perform the action; otherwise `false`.
 *
 * @example
 * ```ts
 * if (canUser(user, 'delete', 'Comment')) {
 *   // Allow comment deletion
 * }
 * ```
 */
export function canUser(
  user: IUser | undefined | null,
  action: Actions,
  subject: SubjectTypes,
  field?: string,
): boolean {
  if (!user) return false;

  const ability = createAbilityForUser(user);
  return field ? ability.can(action, subject, field) : ability.can(action, subject);
}

/**
 * Express middleware that checks if the authenticated user has permission
 * to perform a specific action on a given subject.
 *
 * @param action - The action to authorize (e.g., `'read'`, `'update'`, `'delete'`).
 * @param getSubject - Optional function to dynamically resolve the subject from the request.
 * @returns Express middleware that validates permissions.
 *
 * @example
 * ```ts
 * // Example usage in a route:
 * router.delete(
 *   '/articles/:id',
 *   authenticate,
 *   checkPermission('delete', req => ({ _id: req.params.id, baseModelName: 'Article' })),
 *   articleController.deleteArticle
 * );
 * ```
 */
export function checkPermission(
  action: Actions,
  getSubject?: (req: AuthenticatedRequest) => SubjectTypes,
) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new Error('User not authenticated'));
    }

    const subject = getSubject ? getSubject(req) : 'all';
    if (!canUser(req.user, action, subject)) {
      return next(new Error('Forbidden'));
    }

    next();
  };
}
