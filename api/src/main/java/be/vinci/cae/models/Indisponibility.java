package be.vinci.cae.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDate;

/**
 * Entity representing a user's indisponibility period.
 */
@Entity
public class Indisponibility {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private LocalDate startDate;
  private LocalDate endDate;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  public Long getId() {
    return id;
  }

  public LocalDate getEndDate() {
    return endDate;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public User getUser() {
    return user;
  }

  public void setEndDate(LocalDate endDate) {
    this.endDate = endDate;
  }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public void setId(long id) {
    this.id = id;
  }
}