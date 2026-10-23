import type { AuthenticatedUser, Match as MatchType } from '../types';

export const getMatchVisibility = (
  match: MatchType | null,
  authenticatedUser: AuthenticatedUser | undefined,
) => {
  if (!match) {
    return {
      isTeam1: false,
      isTeam2: false,
      isAdmin: false,
      canSeeScore: false,
      isResponsable: false,
      isSecondResponsable: false,
      isResponsibleTeam1: false,
      isResponsibleTeam2: false,
    };
  }

  const isTeam1 =
    match.team1?.id === authenticatedUser?.team ||
    authenticatedUser?.id === Number(match.team1?.responsable) ||
    authenticatedUser?.id === Number(match.team1?.secondResponsable);

  const isTeam2 =
    match.team2?.id === authenticatedUser?.team ||
    authenticatedUser?.id === Number(match.team2?.responsable) ||
    authenticatedUser?.id === Number(match.team2?.secondResponsable);

  const isAdmin = authenticatedUser?.role === 'ADMIN';

  const isResponsibleTeam1 =
    authenticatedUser?.id === Number(match.team1?.responsable) ||
    authenticatedUser?.id === Number(match.team1?.secondResponsable);

  const isResponsibleTeam2 =
    authenticatedUser?.id === Number(match.team2?.responsable) ||
    authenticatedUser?.id === Number(match.team2?.secondResponsable);

  const isResponsable = isResponsibleTeam1 || isResponsibleTeam2;
  const isSecondResponsable =
    authenticatedUser?.id === Number(match.team1?.secondResponsable) ||
    authenticatedUser?.id === Number(match.team2?.secondResponsable);

  const canSeeScore =
    match.status === 'FINISHED' ||
    isAdmin ||
    isTeam1 ||
    isTeam2 ||
    isResponsibleTeam1 ||
    isResponsibleTeam2;

  return {
    isTeam1,
    isTeam2,
    isAdmin,
    isResponsable,
    isSecondResponsable,
    canSeeScore,
    isResponsibleTeam1,
    isResponsibleTeam2,
  };
};
