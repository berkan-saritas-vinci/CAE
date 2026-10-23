package be.vinci.cae.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for login credentials payload.
 */
public record LoginCredentials(
    @NotBlank
    String mail,
    @NotBlank
    String password
) {

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
}
