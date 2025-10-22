import { Response, NextFunction } from 'express';
import { ForbiddenError } from './errors';
import { AppAbility, Actions, SubjectTypes } from '../abilities/abilities';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Throws a ForbiddenError if the user doesn't have the required permission
 * @param ability - The user's ability object
 * @param action - The action to check (create, read, update, delete, manage)
 * @param subject - The subject to check permissions against
 * @param field - Optional field to check specific field permissions
 */
export function checkAbility(
  ability: AppAbility,
  action: Actions,
  subject: SubjectTypes | Extract<SubjectTypes, string>,
  field?: string,
): void {
  const subjectName =
    typeof subject === 'string' ? subject : (subject as any)?.constructor?.name || 'resource';

  if (field) {
    if (ability.cannot(action, subject, field)) {
      throw new ForbiddenError(`Not allowed to ${action} ${field} on ${subjectName}`);
    }
  } else if (ability.cannot(action, subject)) {
    throw new ForbiddenError(`Not allowed to ${action} ${subjectName}`);
  }
}

/**
 * Middleware factory for checking abilities in route handlers
 * @param action - The action to check (create, read, update, delete, manage)
 * @param getSubject - Function to get the subject from the request
 */
export function checkAbilityMiddleware(
  action: Actions,
  getSubject: (req: AuthenticatedRequest) => SubjectTypes | Promise<SubjectTypes>,
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.ability) {
        throw new Error('Ability not found. Did you forget to use the authenticate middleware?');
      }

      const subject = await getSubject(req);

      if (req.ability.cannot(action, subject)) {
        throw new ForbiddenError('You are not allowed to perform this action');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
