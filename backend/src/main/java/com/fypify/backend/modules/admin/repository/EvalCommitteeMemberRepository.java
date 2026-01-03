package com.fypify.backend.modules.admin.repository;

import com.fypify.backend.modules.admin.entity.EvalCommitteeMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for EvalCommitteeMember entity operations.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. REPOSITORY PATTERN (Enterprise/DDD Pattern)
 *    - Abstracts data access logic for Evaluation Committee members.
 *    - Spring Data JPA provides default CRUD implementation.
 * 
 * 2. QUERY OBJECT PATTERN (Enterprise Pattern)
 *    - @Query annotations encapsulate complex queries.
 *    - Fetch joins optimize N+1 query issues.
 * 
 * ===========================================================================================
 */
@Repository
public interface EvalCommitteeMemberRepository extends JpaRepository<EvalCommitteeMember, UUID> {

    /**
     * Check if a user is a member of the Evaluation Committee.
     */
    boolean existsByUserId(UUID userId);

    /**
     * Delete a member by user ID.
     */
    void deleteByUserId(UUID userId);

    /**
     * Find all members with user details eagerly loaded.
     */
    @Query("SELECT ecm FROM EvalCommitteeMember ecm " +
           "LEFT JOIN FETCH ecm.user u " +
           "ORDER BY ecm.addedAt DESC")
    List<EvalCommitteeMember> findAllWithUserDetails();
}
