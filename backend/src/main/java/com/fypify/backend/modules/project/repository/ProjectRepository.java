package com.fypify.backend.modules.project.repository;

import com.fypify.backend.modules.project.entity.Project;
import com.fypify.backend.modules.project.entity.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Project entity operations.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    /**
     * Find project by group ID.
     */
    Optional<Project> findByGroupId(UUID groupId);

    /**
     * Check if a project exists for a group.
     */
    boolean existsByGroupId(UUID groupId);

    /**
     * Find projects by status.
     */
    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);

    /**
     * Find projects by supervisor ID.
     */
    Page<Project> findBySupervisorId(UUID supervisorId, Pageable pageable);

    /**
     * Find all projects with their groups and supervisors loaded.
     */
    @Query("SELECT p FROM Project p " +
           "LEFT JOIN FETCH p.group g " +
           "LEFT JOIN FETCH g.leader " +
           "LEFT JOIN FETCH p.supervisor")
    List<Project> findAllWithRelations();

    /**
     * Find all projects with relations (paginated).
     */
    @Query(value = "SELECT p FROM Project p " +
           "LEFT JOIN FETCH p.group g " +
           "LEFT JOIN FETCH g.leader " +
           "LEFT JOIN FETCH p.supervisor",
           countQuery = "SELECT COUNT(p) FROM Project p")
    Page<Project> findAllWithRelations(Pageable pageable);

    /**
     * Find project by ID with all relations loaded.
     */
    @Query("SELECT p FROM Project p " +
           "LEFT JOIN FETCH p.group g " +
           "LEFT JOIN FETCH g.leader " +
           "LEFT JOIN FETCH g.members gm " +
           "LEFT JOIN FETCH gm.student " +
           "LEFT JOIN FETCH p.supervisor " +
           "LEFT JOIN FETCH p.approvedBy " +
           "WHERE p.id = :id")
    Optional<Project> findByIdWithRelations(@Param("id") UUID id);

    /**
     * Find pending projects for FYP Committee.
     */
    @Query("SELECT p FROM Project p " +
           "LEFT JOIN FETCH p.group g " +
           "LEFT JOIN FETCH g.leader " +
           "WHERE p.status = 'PENDING_APPROVAL'")
    List<Project> findPendingProjects();

    /**
     * Find pending projects (paginated).
     */
    @Query(value = "SELECT p FROM Project p " +
           "LEFT JOIN FETCH p.group g " +
           "LEFT JOIN FETCH g.leader " +
           "WHERE p.status = 'PENDING_APPROVAL'",
           countQuery = "SELECT COUNT(p) FROM Project p WHERE p.status = 'PENDING_APPROVAL'")
    Page<Project> findPendingProjects(Pageable pageable);

    /**
     * Search projects by title.
     */
    @Query("SELECT p FROM Project p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Project> searchByTitle(@Param("search") String search, Pageable pageable);

    /**
     * Find projects by domain.
     */
    Page<Project> findByDomainContainingIgnoreCase(String domain, Pageable pageable);

    /**
     * Count projects by status.
     */
    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = :status")
    long countByStatus(@Param("status") ProjectStatus status);

    /**
     * Find projects where a user is a proposed supervisor.
     */
    @Query(value = "SELECT * FROM projects p WHERE :userId = ANY(p.proposed_supervisors)", nativeQuery = true)
    List<Project> findByProposedSupervisor(@Param("userId") UUID userId);

    /**
     * Find projects by status and supervisor.
     */
    Page<Project> findByStatusAndSupervisorId(ProjectStatus status, UUID supervisorId, Pageable pageable);
}
