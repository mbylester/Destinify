# Destinify

**A web-based travel destination recommendation system for the Philippines.**

Destinify helps travelers find Philippine destinations that match their budget, interests, preferred activities, destination type, location, and travel duration. Instead of searching across many websites and social media pages, users set their preferences once and get ranked destination matches.

> **Status:** In development. This is an academic project (IPT2).

## Why Destinify?

Most tourism websites offer destination information, galleries, and inspiration, but few help you decide *which* destination fits you best. Destinify organizes destination data in one database and uses a weighted rule-based matching algorithm to score how well each destination fits your preferences. It uses only free and open-source technologies, with no paid AI services or commercial recommendation APIs.

## Features

- **User accounts:** registration, login, profile management, and role-based access
- **Preference selection:** budget, interests, activities, destination type, location, and travel duration
- **Destination catalog:** Philippine destinations with descriptions, categories, activities, estimated budget, and recommended duration
- **Weighted matching:** compatibility scores between your preferences and each destination
- **Search, filter, and favorites:** browse destinations and save the ones you like
- **Map pins:** markers for recommended destinations, using free-tier or open-source mapping services
- **Admin panel:** manage users, destinations, categories, and activities, with basic dashboard summaries and reports

## User Roles

| Role | What they can do |
| --- | --- |
| **Admin** | Manage users, destinations, categories, and activities; view dashboard reports |
| **Traveler** | Set preferences, get recommendations, search destinations, view details, save favorites |
| **Guest** | Browse public destination information without an account |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript, Bootstrap |
| Backend | PHP |
| Database | MySQL |
| Local server | XAMPP (Apache + MySQL) |
| Tools | Git/GitHub, Visual Studio Code, phpMyAdmin, Figma |

## Getting Started

### Prerequisites

- [XAMPP](https://www.apachefriends.org/) with Apache and MySQL
- [Git](https://git-scm.com/)

### Run locally

1. Clone the repository into your XAMPP `htdocs` folder:
   ```
   cd C:\xampp\htdocs
   git clone https://github.com/mbylester/Destinify.git
   ```
2. Start **Apache** and **MySQL** in the XAMPP Control Panel.
3. Open your browser and go to:
   ```
   http://localhost/Destinify/
   ```

Database setup instructions will be added once the MySQL schema is ready.

## Out of Scope

Destinify does not handle online booking, payments, native mobile apps, or custom machine-learning models.

## Author

**Benlester N. Huerto**
