package be.vinci.cae.repositories;

import be.vinci.cae.models.DemandeAdhesion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for adhesion requests.
 */
public interface DemandeAdhesionRepository extends JpaRepository<DemandeAdhesion, Long> {

  /**
   * Returns all adhesion requests for a team.
   *
   * @param teamId team identifier
   * @return adhesion requests
   */
  List<DemandeAdhesion> findByTeamId(Long teamId);

  /**
   * Returns all adhesion requests created by a user.
   *
   * @param userId user identifier
   * @return adhesion requests
   */
  List<DemandeAdhesion> findByUserId(Long userId);
}