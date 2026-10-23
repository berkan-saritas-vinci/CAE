package be.vinci.cae.repositories;

import be.vinci.cae.models.Picture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for accessing Picture entities in the database.
 */
@Repository
public interface PictureRepository extends JpaRepository<Picture, Long> {
  /**
   * Finds a Picture by its link.
   *
   * @param link the unique link of the picture
   * @return a Picture containing the Picture if found, or empty if not found
   */
  Picture findByLink(String link);

  /**
   * Checks if a Picture exists with the given link.
   *
   * @param link the unique link of the picture
   * @return true if a Picture with the link exists, false otherwise
   */
  boolean existsByLink(String link);
}
