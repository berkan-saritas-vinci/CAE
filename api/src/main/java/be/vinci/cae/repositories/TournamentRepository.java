package be.vinci.cae.repositories;

import be.vinci.cae.models.Tournament;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for tournament persistence operations.
 */
@Repository
public interface TournamentRepository extends CrudRepository<Tournament, Long> {

  /**
   * Returns tournaments filtered by state.
   *
   * @param etat the state of the Tournament
   * @return List of Tournament filtered by etat
   */
  List<Tournament> getAllByEtat(String etat);

  @Override
  Optional<Tournament> findById(Long id);

  @Override
  <S extends Tournament> S save(S entity);
}
