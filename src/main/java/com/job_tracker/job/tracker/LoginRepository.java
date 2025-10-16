package com.job_tracker.job.tracker;

import org.springframework.data.repository.CrudRepository;
import java.util.Optional;

public interface LoginRepository extends CrudRepository<LoginUser, Long> {
    Optional<LoginUser> findByEmail(String email);

}
