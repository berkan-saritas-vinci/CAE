package be.vinci.cae.services;

import be.vinci.cae.models.Speciality;
import be.vinci.cae.repositories.SpecialityRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for speciality-related operations.
 */
@Service
public class SpecialityService {

  private final SpecialityRepository specialityRepository;

  /**
   * Creates the service.
   *
   * @param specialityRepository speciality repository
   */
  public SpecialityService(SpecialityRepository specialityRepository) {
    this.specialityRepository = specialityRepository;
  }

  /**
   * Returns all specialities.
   *
   * @return list of specialities
   */
  public List<Speciality> findAll() {
    return specialityRepository.findAll();
  }

  /**
   * Finds a speciality by its name.
   *
   * @param speciality speciality name
   * @return the speciality if found, otherwise null
   */
  public Speciality findBySpeciality(String speciality) {
    return specialityRepository.findBySpeciality(speciality);
  }

  /**
   * Saves a speciality in the repository.
   *
   * @param speciality the speciality to save
   * @return the saved speciality
   */
  public Speciality save(Speciality speciality) {
    return specialityRepository.save(speciality);
  }
}
