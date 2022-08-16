package ru.kata.spring.boot_security.demo.dao;

import org.springframework.stereotype.Repository;
import ru.kata.spring.boot_security.demo.model.User;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;

@Repository
public class UserDaoImpl implements UserDao {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public void addUser(User user) {
        entityManager.persist(user);
    }

    @Override
    public User getUser(long id) {
        return entityManager.find(User.class, id);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<User> getUserByUsername(String username) {
        try {
            return (Optional<User>) entityManager.createQuery("select u from User u where u.username = :username")
                    .setParameter("username", username).getSingleResult();
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<User> getUserList() {
        return entityManager.createQuery("select u from User u").getResultList();
    }

    @Override
    public User editUser(User user) {
        return entityManager.merge(user);
    }

    @Override
    public void deleteUser(long id) {
        entityManager.remove(getUser(id));
    }
}
