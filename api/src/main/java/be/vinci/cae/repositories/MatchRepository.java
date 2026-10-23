package be.vinci.cae.repositories;

import be.vinci.cae.models.Match;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.Tournament;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for match persistence and tournament-based lookup.
 */
@Repository
public interface MatchRepository extends CrudRepository<Match, Long> {

  /**
   * Finds all matches for a given tournament.
   *
   * @param tournament tournament reference
   * @return list of matches for the tournament
   */
  List<Match> getByTournament(Tournament tournament);

  /**
   * Finds all matches for a given tournament.
   *
   * @param team1 tournament reference
   * @return list of matches for the tournament
   */
  List<Match> getByTeam1OrTeam2(Team team1, Team team2);

  /**
   * Finds all matches for a given tournament and turn.
   *
   * @param tournament tournament reference
   * @param turn the turn number
   * @return list of matches for the tournament and turn
   */
  List<Match> getByTournamentAndTurn(Tournament tournament, Long turn);

  /**
   * Finds a match by its identifier.
   *
   * @param id match identifier
   * @return match entity
   */
  Match getById(long id);
}

