package be.vinci.cae.repositories;

import be.vinci.cae.models.InscriptionTournament;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * Repository for inscription tournament persistence.
 */
public interface InscriptionTournamentRepository
    extends JpaRepository<InscriptionTournament, Long> {

  /**
   * Checks if a team is already registered for a tournament.
   *
   * @param teamId team identifier
   * @param tournamentId tournament identifier
   * @return true if an inscription already exists
   */
  boolean existsByTeamIdAndTournamentId(Long teamId, Long tournamentId);

  /**
   * Returns all inscriptions for a given team.
   *
   * @param teamId team identifier
   * @return list of inscriptions for the team
   */
  List<InscriptionTournament> findByTeamId(Long teamId);

  /**
   * Returns inscription counts grouped by tournament id.
   *
   * @return rows with [tournamentId, inscriptionCount]
   */
  @Query("SELECT i.tournament.id, COUNT(i) FROM InscriptionTournament i GROUP BY i.tournament.id")
  List<Object[]> countGroupedByTournamentId();

  /**
   * Returns all inscriptions for a given tournament.
   *
   * @param tournamentId tournament identifier
   * @return list of inscriptions for the tournament
   */
  List<InscriptionTournament> findByTournamentId(Long tournamentId);
}
