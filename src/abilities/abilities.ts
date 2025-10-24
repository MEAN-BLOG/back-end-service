/**
 * @file abilities.ts
 * @description CASL-based dynamic permissions system for role-based access control.
 * Provides automatic ID normalization and model type detection for MongoDB documents.
 * @module abilities
 */

import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  MongoAbility,
} from '@casl/ability';
import { Types } from 'mongoose';
import { UserRole } from '../modules/shared/enums/role.enum';
import { IArticle, IComment, IReply, IUser } from '../modules/shared';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Available permission actions in the system.
 * @typedef {('manage'|'create'|'read'|'update'|'delete')} Actions
 */
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';

/**
 * String representation of model types for CASL subject detection.
 * @typedef {('Article'|'Comment'|'User'|'Reply'|'all')} SubjectTypeName
 */
export type SubjectTypeName = 'Article' | 'Comment' | 'User' | 'Reply' | 'Statistics' | 'all';

/**
 * Union type of all model interfaces in the system.
 * @typedef {(IArticle|IComment|IUser|IReply)} ModelType
 */
export type ModelType = IArticle | IComment | IUser | IReply;

/**
 * Valid CASL subject types, can be either a string name or a model instance.
 * @typedef {(SubjectTypeName|ModelType)} SubjectTypes
 */
export type SubjectTypes = SubjectTypeName | ModelType;

/**
 * CASL ability instance with typed actions and subjects.
 * @typedef {MongoAbility<[Actions, SubjectTypes]>} AppAbility
 */
export type AppAbility = MongoAbility<[Actions, SubjectTypes]>;

/**
 * Normalizes Mongoose documents by converting ObjectIds to strings and ensuring
 * the baseModelName property exists for CASL subject type detection.
 *
 * @param {any} doc - The document to normalize (can be a Mongoose document or plain object)
 * @returns {any} Normalized document with string IDs and baseModelName property
 *
 * @example
 * const doc = { _id: new ObjectId('...'), userId: new ObjectId('...') };
 * const normalized = normalizeDocument(doc);
 * // Returns: { _id: '...', userId: '...', baseModelName: 'Article' }
 */
function normalizeDocument(doc: any): any {
  if (!doc || typeof doc !== 'object') return doc;

  const copy = { ...doc };

  if (copy._id && Types.ObjectId.isValid(copy._id)) copy._id = copy._id.toString();
  if (copy.userId && Types.ObjectId.isValid(copy.userId)) copy.userId = copy.userId.toString();

  // Determine model name for CASL
  copy.baseModelName =
    copy.baseModelName ?? copy.constructor?.modelName ?? copy.constructor?.name ?? 'element';

  return copy;
}

/**
 * Extracts the model name from a subject for CASL type detection.
 *
 * @param {ModelType|string} item - The subject item (model instance or string)
 * @returns {ExtractSubjectType<SubjectTypes>} The extracted subject type name
 *
 * @example
 * getModelName('Article'); // Returns: 'Article'
 * getModelName(articleInstance); // Returns: 'Article' (from baseModelName)
 * getModelName(null); // Returns: 'all'
 */
function getModelName(item: ModelType | string): ExtractSubjectType<SubjectTypes> {
  if (!item) return 'all';
  if (typeof item === 'string') return item as ExtractSubjectType<SubjectTypes>;
  return (item.baseModelName as ExtractSubjectType<SubjectTypes>) || 'all';
}

/**
 * Defines CASL abilities for a user based on their role.
 * Configures permissions hierarchy: Guest < Writer < Editor < Admin.
 *
 * @param {IUser} user - The user for whom to define abilities
 * @returns {AppAbility} Configured CASL ability instance
 *
 * @description
 * Permission levels:
 * - **Guest**: Read articles/comments, create/update/delete own comments
 * - **Writer**: Guest permissions + create/update/delete own articles
 * - **Editor**: Manage all articles and comments (cannot delete users)
 * - **Admin**: Full system access (manage all resources)
 *
 * @example
 * const user = { _id: '123', role: UserRole.WRITER };
 * const ability = defineAbilitiesFor(user);
 * ability.can('update', 'Article'); // true for own articles
 */
export function defineAbilitiesFor(user: IUser): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  /** Guest permissions */
  can('read', 'Article');
  can('read', 'Comment');
  can('create', 'Comment');
  can('create', 'Reply');
  can('update', 'Comment', { userId: String(user?._id) });
  can('delete', 'Comment', { userId: String(user?._id) });

  /** Writer permissions */
  if (user.role === UserRole.WRITER) {
    can('create', 'Article');
    can('update', 'Article', { userId: String(user?._id) });
    can('delete', 'Article', { userId: String(user?._id) });
  }

  /** Editor permissions */
  if (user.role === UserRole.EDITOR) {
    can('manage', 'Article');
    can('manage', 'Comment');
    cannot('delete', 'User');
  }

  /** Admin permissions */
  if (user.role === UserRole.ADMIN) {
    can('manage', 'all');
    can('read', 'Statistics');
  }

  return build({
    detectSubjectType: (subject) => getModelName(subject),
  });
}

/**
 * Creates a CASL ability instance for a specific user.
 * Convenience wrapper around {@link defineAbilitiesFor}.
 *
 * @param {IUser} user - The user for whom to create abilities
 * @returns {AppAbility} Configured CASL ability instance
 *
 * @example
 * const ability = createAbilityForUser(req.user);
 * if (ability.can('delete', article)) {
 *   await article.remove();
 * }
 */
export function createAbilityForUser(user: IUser): AppAbility {
  return defineAbilitiesFor(user);
}

/**
 * Express middleware for checking user permissions on specific resources.
 * Automatically normalizes subjects and validates access based on user abilities.
 *
 * @param {Actions} action - The action to check permission for (e.g., 'read', 'update')
 * @param {Function} [getSubject] - Optional function to retrieve the subject from the request
 * @returns {Function} Express middleware function
 *
 * @throws {401} When user is not authenticated
 * @throws {403} When user lacks permission for the action
 *
 * @example
 * // Check permission on a specific article
 * router.delete(
 *   '/articles/:id',
 *   checkPermission('delete', async (req) => {
 *     return await Article.findById(req.params.id);
 *   })
 * );
 *
 * @example
 * // Check general permission without specific subject
 * router.post(
 *   '/articles',
 *   checkPermission('create', () => 'Article')
 * );
 */
export function checkPermission(
  action: Actions,
  getSubject?: (req?: AuthenticatedRequest) => SubjectTypes | Promise<SubjectTypes>,
) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return _res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    try {
      let subject = getSubject ? await getSubject(req) : 'all';

      if (typeof subject === 'object' && subject !== null) {
        if ('toObject' in subject && typeof subject.toObject === 'function') {
          subject = normalizeDocument(subject.toObject());
        } else {
          subject = normalizeDocument(subject);
        }
      }

      const ability = createAbilityForUser(req.user);
      const subjectName =
        typeof subject === 'string' ? subject : (subject.baseModelName ?? 'element');
      const subjectId = typeof subject === 'string' ? '' : subject._id ? ` (${subject.id})` : '';

      if (!ability.can(action, subject)) {
        return _res.status(403).json({
          success: false,
          message: `You are not allowed to ${action} this ${subjectName}${subjectId}`,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
