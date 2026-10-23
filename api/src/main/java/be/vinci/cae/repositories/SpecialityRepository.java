package be.vinci.cae.repositories;

import be.vinci.cae.models.Speciality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for accessing Speciality entities in the database.
 */
@Repository
public interface SpecialityRepository extends JpaRepository<Speciality, Long> {

  /**
   * Finds a Speciality by its name.
   *
   * @param speciality the unique name of the speciality
   * @return a Speciality containing the Speciality if found, or empty if not found
   */
  Speciality findBySpeciality(String speciality);

  /**
   * Checks if a Speciality exists with the given name.
   *
   * @param speciality the unique name of the speciality
   * @return true if a Speciality with the name exists, false otherwise
   */
  boolean existsBySpeciality(String speciality);
}
