import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Team, AuthenticatedUser, TeamMember } from '../types';
import * as teamService from '../services/team.service';

export function useTeam(user: AuthenticatedUser | undefined) {
  const location = useLocation();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [responsableNom, setResponsableNom] = useState('');
  const [secondResponsableNom, setSecondResponsableNom] = useState('');
  const [secondResponsableId, setSecondResponsableId] = useState<number | null>(
    null,
  );
  const [membres, setMembres] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (location.state?.team) {
      setTeam(location.state.team);
      setLoading(false);
      return;
    }

    if (!user?.id) {
      setTeam(null);
      setLoading(false);
      return;
    }

    if (user.role === 'BANNED' || !user.team) {
      setTeam(null);
      setLoading(false);
      return;
    }

    // Charger la team de l'utilisateur
    const loadTeam = async () => {
      try {
        const data = await teamService.getTeamByUserId(user.id);
        setTeam(data);
      } catch {
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [user?.id, user?.role, user?.team, location.state?.team, user]);

  useEffect(() => {
    if (!team) return;

    teamService
      .getTeamMembers(team.id)
      .then(setMembres)
      .catch(() => setMembres([]));
  }, [team]);

  useEffect(() => {
    if (!team) return;

    // RESPONSABLE
    if (team.responsable && Number(team.responsable) > 0) {
      teamService
        .getUserById(team.responsable)
        .then(async (data) => {
          if (data) {
            setResponsableNom(data.tag || data.mail);
          } else {
            // Responsable inexistant → promotion automatique
            if (membres.length > 0) {
              const nouveau = membres[0];

              await teamService.setResponsable(team.id, nouveau.id);

              setResponsableNom(nouveau.tag || nouveau.mail);
              setTeam((prev) =>
                prev ? { ...prev, responsable: String(nouveau.id) } : prev,
              );
            } else {
              setResponsableNom('');
            }
          }
        })
        .catch(() => {
          setResponsableNom('');
        });
    } else {
      setResponsableNom('');
    }

    // SECOND RESPONSABLE
    const sr = Number(team.secondResponsable);

    if (sr > 0) {
      setSecondResponsableId(sr);
      teamService.getUserById(sr).then((data) => {
        if (data) setSecondResponsableNom(data.tag || data.mail);
      });
    } else {
      setSecondResponsableId(null);
      setSecondResponsableNom('');
    }
  }, [team, membres]);

  const handleQuitTeam = async (token: string) => {
    if (!user) return;
    await teamService.quitTeam(user.id, token);
    setTeam(null);
  };

  const handleNommerSecond = async (membreId: number, token: string) => {
    if (!team) return;
    await teamService.setSecondResponsable(team.id, membreId, token);
    setSecondResponsableId(membreId);

    // Mettre à jour le team pour refresh
    setTeam((prev) =>
      prev ? { ...prev, secondResponsable: String(membreId) } : prev,
    );

    const membre = membres.find((m) => m.id === membreId);
    if (membre) {
      setSecondResponsableNom(membre.tag || membre.mail);
    }
  };

  const handleExcludeMember = async (memberId: number, token: string) => {
    await teamService.excludeMember(team!.id, memberId, token);
    setMembres((prev) => prev.filter((m) => m.id !== memberId));

    // Si le membre exclu est le second responsable, réinitialiser les états
    if (secondResponsableId === memberId) {
      setSecondResponsableId(null);
      setSecondResponsableNom('');
      setTeam((prev) => (prev ? { ...prev, secondResponsable: '0' } : prev));
    }
  };

  return {
    team,
    setTeam,
    loading,
    responsableNom,
    secondResponsableNom,
    secondResponsableId,
    membres,
    handleQuitTeam,
    handleNommerSecond,
    handleExcludeMember,
  };
}
