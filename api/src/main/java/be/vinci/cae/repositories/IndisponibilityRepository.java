package be.vinci.cae.repositories;

import be.vinci.cae.models.Indisponibility;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for indisponibility persistence operations.
 */
public interface IndisponibilityRepository extends JpaRepository<Indisponibility, Long> {

  /**
   * Finds all indisponibilities for a given user.
   *
   * @param userId user identifier
   * @return list of indisponibilities linked to the user
   */
  List<Indisponibility> findByUserId(Long userId);

  /**
   * Checks whether an indisponibility period overlaps an existing one for a user.
   *
   * @param userId user identifier
   * @param endDate requested end date
   * @param startDate requested start date
   * @return true when an overlapping period exists
   */
  boolean existsByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
      Long userId,
      LocalDate endDate,
      LocalDate startDate
  );
}
