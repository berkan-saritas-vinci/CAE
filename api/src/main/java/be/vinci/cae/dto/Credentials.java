package be.vinci.cae.dto;

import be.vinci.cae.models.Picture;
import be.vinci.cae.models.Speciality;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Date;

/**
 * Represents the credential information of a user.
 * This record contains the data necessary for registering or logging in a user:
 * their profile picture, email, password, role, specialty, an associated tag, and profile image.
 */
public record Credentials(

    @NotNull
    String picture,
    @NotBlank
    String mail,
    @NotBlank
    String password,
    @NotBlank
    String tag,
    @NotNull
    String speciality,

    String role,

    Date creationDate
) {

  /**
   * Returns the user's profile picture.
   *
   * @return the {@link Picture} associated with the user, not null
   */
  @Override
  public String picture() {
    return picture;
  }

  /**
   * Returns the user's email address.
   *
   * @return the user's email, not blank
   */
  @Override
  public String mail() {
    return mail;
  }

  /**
   * Returns the user's password.
   *
   * @return the password, not blank
   */
  @Override
  public String password() {
    return password;
  }

  /**
   * Returns the tag associated with the user.
   *
   * @return the tag, not blank
   */
  @Override
  public String tag() {
    return tag;
  }

  /**
   * Returns the user's specialty.
   *
   * @return the {@link Speciality} of the user, not null
   */
  @Override
  public String speciality() {
    return speciality;
  }

  /**
   * Returns the role of the user in the system.
   *
   * @return the role, not blank
   */
  @Override
  public String role() {
    return role;
  }

  /**
   * Returns the date of creation of the account of the user in the system.
   *
   * @return the date of creation of the account
   */
  @Override
  public Date creationDate() {
    return creationDate;
  }
}
