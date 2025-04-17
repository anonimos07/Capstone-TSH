    package com.example.tsh.web.Entity;


    import com.fasterxml.jackson.annotation.JsonManagedReference;
    import jakarta.persistence.*;
    import lombok.Getter;
    import lombok.Setter;

    import java.util.HashSet;
    import java.util.List;
    import java.util.Set;

    @Setter
    @Getter
    @Entity
    @Table(name = "employee")
    public class Employee {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private long employeeId;

        public String username;
        public String password;
        public String email;
        public String firstName;
        public String lastName;
        public String contact;
        public String position;
        public float baseSalary;

        @Enumerated(EnumType.STRING)
        private Role role = Role.EMPLOYEE;

        @JsonManagedReference
        @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<TimeLog> timeLogs;

        public Employee(String username, String password,String email,String firstName,
                        String lastName, String contact, String position, float baseSalary){
            this.username = username;
            this.password = password;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.contact = contact;
            this.position = position;
            this.baseSalary = baseSalary;
            this.role = Role.EMPLOYEE;
        }
        public Employee() {
            this.role = Role.EMPLOYEE;
        }
        public List<TimeLog> getTimeLogs() {
            return timeLogs;
        }

        public void setTimeLogs(List<TimeLog> timeLogs) {
            this.timeLogs = timeLogs;
        }


    }
