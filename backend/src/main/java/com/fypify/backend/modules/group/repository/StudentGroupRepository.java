package com.fypify.backend.modules.group.repository;

import com.fypify.backend.modules.group.entity.StudentGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for StudentGroup entity operations.
 */
@Repository
public interface StudentGroupRepository extends JpaRepository<StudentGroup, UUID> {

    /**
     * Find a group by name.
     */
    Optional<StudentGroup> findByName(String name);

    /**
     * Check if a group name exists.
     */
    boolean existsByName(String name);

    /**
     * Find groups where a user is the leader.
     */
    Page<StudentGroup> findByLeaderId(UUID leaderId, Pageable pageable);

    /**
     * Find the group that a student belongs to.
     */
    @Query("SELECT g FROM StudentGroup g JOIN g.members m WHERE m.student.id = :studentId")
    Optional<StudentGroup> findByMemberStudentId(@Param("studentId") UUID studentId);

    /**
     * Check if a student is already in any group.
     */
    @Query("SELECT COUNT(g) > 0 FROM StudentGroup g JOIN g.members m WHERE m.student.id = :studentId")
    boolean existsByMemberStudentId(@Param("studentId") UUID studentId);

    /**
     * Find all groups with eager loading of members and leader.
     */
    @Query("SELECT DISTINCT g FROM StudentGroup g " +
           "LEFT JOIN FETCH g.leader " +
           "LEFT JOIN FETCH g.members m " +
           "LEFT JOIN FETCH m.student")
    Page<StudentGroup> findAllWithMembers(Pageable pageable);

    /**
     * Find a group by ID with eager loading.
     */
    @Query("SELECT g FROM StudentGroup g " +
           "LEFT JOIN FETCH g.leader " +
           "LEFT JOIN FETCH g.members m " +
           "LEFT JOIN FETCH m.student " +
           "WHERE g.id = :id")
    Optional<StudentGroup> findByIdWithMembers(@Param("id") UUID id);

    /**
     * Count total groups.
     */
    @Query("SELECT COUNT(g) FROM StudentGroup g")
    long countGroups();

    /**
     * Search groups by name (case-insensitive).
     */
    @Query("SELECT g FROM StudentGroup g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<StudentGroup> searchByName(@Param("search") String search, Pageable pageable);
}
