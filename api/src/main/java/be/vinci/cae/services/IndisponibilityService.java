package be.vinci.cae.services;

import be.vinci.cae.models.Indisponibility;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.IndisponibilityRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for indisponibility business operations.
 */
@Service
public class IndisponibilityService {

  private final IndisponibilityRepository repository;

  /**
   * Creates the service.
   *
   * @param repository indisponibility repository
   */
  public IndisponibilityService(IndisponibilityRepository repository) {
    this.repository = repository;
  }

  /**
   * Returns all indisponibilities for a user.
   *
   * @param userId user identifier
   * @return user indisponibilities
   */
  public List<Indisponibility> getByUser(Long userId) {
    return repository.findByUserId(userId);
  }

  /**
   * Creates a new indisponibility after validating dates and overlap constraints.
   *
   * @param startDate start date of the period
   * @param endDate end date of the period
   * @param user owner of the indisponibility
   * @return persisted indisponibility
   */
  public Indisponibility create(LocalDate startDate, LocalDate endDate, User user) {

    if (startDate == null || endDate == null) {
      throw new IllegalArgumentException("Dates cannot be null");
    }

    if (startDate.isAfter(endDate)) {
      throw new IllegalArgumentException("Start date must be before end date");
    }

    boolean overlap = repository
        .existsByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            user.getId(),
            endDate,
            startDate
        );

    if (overlap) {
      throw new IllegalArgumentException("Indisponibility overlaps with another period");
    }

    Indisponibility indisponibility = new Indisponibility();
    indisponibility.setStartDate(startDate);
    indisponibility.setEndDate(endDate);
    indisponibility.setUser(user);

    return repository.save(indisponibility);
  }

  /**
   * Deletes an indisponibility by identifier.
   *
   * @param id indisponibility identifier
   */
  public void delete(Long id) {
    repository.deleteById(id);
  }

  /**
   * Find an indisponibility by his id.
   *
   * @param id indisponibility id
   * @return the indisponibility
   */
  public Indisponibility getById(Long id) {
    return repository.findById(id)
      .orElseThrow(() -> new IllegalArgumentException("Indisponibility not found"));
  }
}