package be.vinci.cae.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.Date;


/**
 * Represents a user entity stored in the database.
 */
@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "picture_id", nullable = false)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private Picture picture;

  @Column(nullable = false, unique = true)
  private String mail;

  @Column(nullable = false)
  private String password;

  @Column(nullable = false)
  private String tag;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "speciality_id", nullable = false)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private Speciality speciality;

  @Column(nullable = false)
  private String role; // USER, ADMIN, BANNED

  @Column(nullable = false)
  private Date creationDate;

  @ManyToOne
  @JoinColumn(name = "team_id")
  private Team team;

  /**
   * Gets the user ID.
   *
   * @return the user ID
   */
  public long getId() {
    return id;
  }

  /**
   * Gets the user's picture.
   *
   * @return the picture
   */
  public Picture getPicture() {
    return picture;
  }

  /**
   * Gets the user's email.
   *
   * @return the email
   */
  public String getMail() {
    return mail;
  }

  /**
   * Gets the user's password.
   *
   * @return the password
   */
  public String getPassword() {
    return password;
  }

  /**
   * Gets the user's tag.
   *
   * @return the tag
   */
  public String getTag() {
    return tag;
  }

  /**
   * Gets the user's speciality.
   *
   * @return the speciality
   */
  public Speciality getSpeciality() {
    return speciality;
  }

  /**
   * Gets the user's role.
   *
   * @return the role (USER or ADMIN)
   */
  public String getRole() {
    return role;
  }

  /**
   * Sets the user ID.
   *
   * @param id the user ID
   */
  public void setId(long id) {
    this.id = id;
  }

  /**
   * Sets the user's picture.
   *
   * @param picture the picture
   */
  public void setPicture(Picture picture) {
    this.picture = picture;
  }

  /**
   * Sets the user's email.
   *
   * @param mail the email
   */
  public void setMail(String mail) {
    this.mail = mail;
  }

  /**
   * Sets the user's password.
   *
   * @param password the password
   */
  public void setPassword(String password) {
    this.password = password;
  }

  /**
   * Sets the user's tag.
   *
   * @param tag the tag
   */
  public void setTag(String tag) {
    this.tag = tag;
  }

  /**
   * Sets the user's speciality.
   *
   * @param speciality the speciality
   */
  public void setSpeciality(Speciality speciality) {
    this.speciality = speciality;
  }

  /**
   * Sets the user's role.
   *
   * @param role the role (USER or ADMIN)
   */
  public void setRole(String role) {
    this.role = role;
  }

  /**
   * Sets the user creation date.
   *
   * @param creationDate the user creation date
   */
  public void setCreationDate(Date creationDate) {
    this.creationDate = creationDate;
  }

  /**
   * Gets the user creation date.
   *
   * @return creation_date of the user
   */
  public Date getCreatedAt() {
    return creationDate;
  }

  /**
   * Gets the team the user belongs to.
   *
   * @return the team
   */
  public Team getTeam() {
    return team;
  }

  public void setTeam(Team team) {
    this.team = team;
  }
}
