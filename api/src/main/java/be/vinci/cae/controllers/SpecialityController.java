package be.vinci.cae.controllers;

import be.vinci.cae.models.Speciality;
import be.vinci.cae.services.SpecialityService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing specialities.
 */
@RestController
@RequestMapping("/specialities/")
public class SpecialityController {

  private final SpecialityService specialityService;

  /**
   * Constructor for SpecialityController.
   *
   * @param specialityService the service used to access Speciality repository
   */
  @Autowired
  public SpecialityController(SpecialityService specialityService) {
    this.specialityService = specialityService;
  }

  /**
   * Creates a new Speciality in the database.
   * Example request: POST /specialities/create
   *
   * @param speciality the Speciality object sent in the request body (must include speciality name)
   * @return ResponseEntity containing the created Speciality or a bad request if name is missing
   */
  @PostMapping("/create")
  public ResponseEntity<Speciality> createSpeciality(@RequestBody Speciality speciality) {
    if (speciality.getSpeciality() == null || speciality.getSpeciality().isEmpty()) {
      return ResponseEntity.badRequest().build();
    }
    Speciality savedSpeciality = specialityService.save(speciality);
    return ResponseEntity.ok(savedSpeciality);
  }

  /**
   * Returns all specialities.
   * Example request: GET /specialities/all
   *
   * @return list of all Speciality objects
   */
  @GetMapping("/all")
  public List<Speciality> getAllSpecialities() {
    return specialityService.findAll();
  }

  /**
   * Finds a Speciality by its name.
   * Example request: GET /specialities/find?name=Cardiology
   *
   * @param speciality the name of the speciality
   * @return the Speciality if found, 404 otherwise
   */
  @GetMapping("/find")
  public ResponseEntity<Speciality> findByName(@RequestParam String speciality) {
    Speciality result = specialityService.findBySpeciality(speciality);

    if (result == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(result);
  }
}
