package be.vinci.cae.repositories;

import be.vinci.cae.models.Match;
import be.vinci.cae.models.SelectionMatch;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.User;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for inscription-match persistence operations.
 */
@Repository
public interface SelectionMatchRepository extends CrudRepository<SelectionMatch, Long> {
  /**
   * Finds registrations by team.
   *
   * @param team team to filter on
   * @return matching registrations
   */
  Iterable<SelectionMatch> getByTeam(Team team);

  /**
   * Finds registrations by match.
   *
   * @param match match to filter on
   * @return matching registrations
   */
  List<SelectionMatch> getByMatch(Match match);

  /**
   * Finds registrations by user.
   *
   * @param user user to filter on
   * @return matching registrations
   */
  Iterable<SelectionMatch> getByUser(User user);
}
