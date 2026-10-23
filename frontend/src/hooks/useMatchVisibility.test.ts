import { describe, expect, it } from 'vitest';
import { getMatchVisibility } from './useMatchVisibility';

const defaultMatch = {
  id: 1,
  tournament: 2,
  team1: {
    id: 10,
    name: 'Team 1',
    responsable: '100',
    secondResponsable: '101',
  },
  team2: {
    id: 20,
    name: 'Team 2',
    responsable: '200',
    secondResponsable: '201',
  },
  turn: 1,
  status: 'IN_PROGRESS',
  administrator: {
    id: 999,
    mail: 'admin@test.com',
    tag: 'admin_user',
  },
  dateTime: '2026-04-19T10:00:00',
};

describe('getMatchVisibility', () => {
  it('renvoie false pour toutes les propriétés si le match est null', () => {
    const result = getMatchVisibility(null, undefined);

    expect(result).toEqual({
      isTeam1: false,
      isTeam2: false,
      isAdmin: false,
      canSeeScore: false,
      isResponsable: false,
      isSecondResponsable: false,
      isResponsibleTeam1: false,
      isResponsibleTeam2: false,
    });
  });

  it('reconnaît un admin et autorise l affichage du score', () => {
    const result = getMatchVisibility(defaultMatch, {
      id: 999,
      mail: 'admin@test.com',
      password: 'x',
      token: 't',
      tag: 'admin',
      picture: '',
      speciality: {},
      role: 'ADMIN',
    });

    expect(result.isAdmin).toBe(true);
    expect(result.canSeeScore).toBe(true);
    expect(result.isTeam1).toBe(false);
    expect(result.isTeam2).toBe(false);
  });

  it('reconnaît un membre de team1 et autorise l affichage du score', () => {
    const result = getMatchVisibility(defaultMatch, {
      id: 500,
      mail: 'user@test.com',
      password: 'x',
      token: 't',
      tag: 'user',
      picture: '',
      speciality: {},
      team: 10,
    });

    expect(result.isTeam1).toBe(true);
    expect(result.canSeeScore).toBe(true);
    expect(result.isResponsable).toBe(false);
  });

  it('reconnaît le responsable de la team2 et renvoi les variables attendues', () => {
    const result = getMatchVisibility(defaultMatch, {
      id: 200,
      mail: 'resp2@test.com',
      password: 'x',
      token: 't',
      tag: 'resp2',
      picture: '',
      speciality: {},
    });

    expect(result.isTeam2).toBe(true);
    expect(result.isResponsibleTeam2).toBe(true);
    expect(result.isResponsable).toBe(true);
    expect(result.canSeeScore).toBe(true);
  });

  it('ne permet pas de voir le score pour un utilisateur extérieur quand le match n est pas fini', () => {
    const result = getMatchVisibility(defaultMatch, {
      id: 777,
      mail: 'outside@test.com',
      password: 'x',
      token: 't',
      tag: 'outside',
      picture: '',
      speciality: {},
    });

    expect(result.canSeeScore).toBe(false);
    expect(result.isTeam1).toBe(false);
    expect(result.isTeam2).toBe(false);
    expect(result.isAdmin).toBe(false);
  });
});
