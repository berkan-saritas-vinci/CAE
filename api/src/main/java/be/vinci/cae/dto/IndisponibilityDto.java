package be.vinci.cae.dto;

/**
 * DTO used to exchange indisponibility data.
 */
public class IndisponibilityDto {

  private Long id;
  private String startDate;
  private String endDate;

  /**
   * Returns the indisponibility identifier.
   *
   * @return indisponibility identifier
   */
  public Long getId() {
    return id;
  }

  /**
   * Sets the indisponibility identifier.
   *
   * @param id indisponibility identifier
   */
  public void setId(Long id) {
    this.id = id;
  }

  /**
   * Returns the start date.
   *
   * @return start date as a string
   */
  public String getStartDate() {
    return startDate;
  }

  /**
   * Sets the start date.
   *
   * @param startDate start date as a string
   */
  public void setStartDate(String startDate) {
    this.startDate = startDate;
  }

  /**
   * Returns the end date.
   *
   * @return end date as a string
   */
  public String getEndDate() {
    return endDate;
  }

  /**
   * Sets the end date.
   *
   * @param endDate end date as a string
   */
  public void setEndDate(String endDate) {
    this.endDate = endDate;
  }
}