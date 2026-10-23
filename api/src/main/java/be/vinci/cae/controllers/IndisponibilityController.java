package be.vinci.cae.controllers;

import be.vinci.cae.dto.IndisponibilityDto;
import be.vinci.cae.models.Indisponibility;
import be.vinci.cae.models.User;
import be.vinci.cae.services.IndisponibilityService;
import be.vinci.cae.services.UserService;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller responsible for managing user indisponibilities.
 * Provides CRUD operations for creating, retrieving, updating and deleting
 * periods during which a user is unavailable.
 */
@RestController
@RequestMapping("/indisponibilities")
public class IndisponibilityController {

  private record ParsedDates(LocalDate start, LocalDate end, ResponseEntity<?> errorResponse) {
  }

  private final IndisponibilityService service;
  private final UserService userService;

  /**
   * Creates a new controller instance.
   *
   * @param service the service handling indisponibility operations
   * @param userService the service handling user retrieval
   */
  public IndisponibilityController(
      IndisponibilityService service,
      UserService userService
  ) {
    this.service = service;
    this.userService = userService;
  }

  /**
   * Retrieves all indisponibilities for a given user.
   *
   * @param userId the ID of the user whose indisponibilities must be returned
   * @return a list of {@link IndisponibilityDto} representing the user's indisponibilities
   */
  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public List<IndisponibilityDto> getAll(@RequestParam Long userId) {
    return service.getByUser(userId).stream().map(this::toDto).toList();
  }

  /**
   * Retrieves a single indisponibility by its ID.
   *
   * @param id the ID of the indisponibility
   * @return a {@link ResponseEntity} containing the indisponibility or a 404 status if not found
   */
  @GetMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<?> getById(@PathVariable Long id) {
    Indisponibility i = service.getById(id);
    if (i == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(toDto(i));
  }

  /**
   * Creates a new indisponibility for a user.
   *
   * @param userId the ID of the user for whom the indisponibility is created
   * @param dto the payload containing start and end dates
   * @return a {@link ResponseEntity} containing the created indisponibility or an error message
   */
  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<?> create(@RequestParam Long userId, @RequestBody IndisponibilityDto dto) {
    return withParsedDates(dto, (start, end) -> createIndisponibility(userId, start, end));
  }

  /**
   * Deletes an indisponibility by its ID.
   *
   * @param id the ID of the indisponibility to delete
   * @return a 204 No Content response when deletion succeeds
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }

  /**
   * Validates and parses dates from the DTO.
   *
   * @param dto the DTO containing date strings
   * @return null if dates are valid, otherwise a ResponseEntity with error message
   */
  private ParsedDates validateAndParseDates(IndisponibilityDto dto) {
    if (dto.getStartDate() == null || dto.getEndDate() == null) {
      return new ParsedDates(
          null,
          null,
          ResponseEntity.badRequest().body(Map.of("message", "Dates obligatoires"))
      );
    }

    try {
      LocalDate start = LocalDate.parse(dto.getStartDate());
      LocalDate end = LocalDate.parse(dto.getEndDate());
      return new ParsedDates(start, end, null);
    } catch (Exception e) {
      return new ParsedDates(
          null,
          null,
          ResponseEntity.badRequest().body(Map.of("message", "Format de date invalide"))
      );
    }
  }

  private ResponseEntity<?> withParsedDates(
      IndisponibilityDto dto,
      BiFunction<LocalDate, LocalDate, ResponseEntity<?>> action
  ) {
    ParsedDates parsedDates = validateAndParseDates(dto);
    if (parsedDates.errorResponse() != null) {
      return parsedDates.errorResponse();
    }
    return action.apply(parsedDates.start(), parsedDates.end());
  }

  private ResponseEntity<?> createIndisponibility(Long userId, LocalDate start, LocalDate end) {
    User user = userService.findById(userId);
    if (user == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("message", "User not found"));
    }

    Indisponibility created = service.create(start, end, user);
    return ResponseEntity.ok(toDto(created));
  }

  /**
   * Converts an Indisponibility entity to a DTO.
   *
   * @param indisponibility the entity to convert
   * @return the converted DTO
   */
  private IndisponibilityDto toDto(Indisponibility indisponibility) {
    IndisponibilityDto dto = new IndisponibilityDto();
    dto.setId(indisponibility.getId());
    dto.setStartDate(indisponibility.getStartDate().toString());
    dto.setEndDate(indisponibility.getEndDate().toString());
    return dto;
  }
}
