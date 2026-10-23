package be.vinci.cae.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entity representing a speciality in the system.
 * This class is mapped to the "specialities" table in the database
 * and stores the different specialities that can be associated with users.
 */
@Entity
@Table(name = "specialities")
public class Speciality {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  @Column(nullable = false, unique = true)
  private String speciality;

  /**
   * Returns the unique identifier of the speciality.
   *
   * @return the speciality id
   */
  public long getId() {
    return id;
  }

  /**
   * Returns the name of the speciality.
   *
   * @return the speciality name
   */
  public String getSpeciality() {
    return speciality;
  }

  /**
   * Sets the unique identifier of the speciality.
   *
   * @param id the speciality id
   */
  public void setId(long id) {
    this.id = id;
  }

  /**
   * Sets the name of the speciality.
   *
   * @param speciality the speciality name
   */
  public void setSpeciality(String speciality) {
    this.speciality = speciality;
  }
}
