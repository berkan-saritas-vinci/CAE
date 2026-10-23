package be.vinci.cae.repositories;

import be.vinci.cae.models.Team;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for accessing Team entities in the database.
 */
@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

  /**
   * Finds a Team by its name.
   *
   * @param name the unique name of the team
   * @return an Optional containing the Team if found, or empty if not found
   */
  Optional<Team> findByName(String name);

  /**
   * Checks if a Team exists with the given name.
   *
   * @param name the unique name of the team
   * @return true if a Team with the name exists, false otherwise
   */
  boolean existsByName(String name);

  /**
   * Finds a Team by its name.
   *
   * @param name the unique name of the team
   * @return an Optional containing the Team if found, or empty if not found
   */
  Team getByName(String name);

}
