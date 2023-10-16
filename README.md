# Bloggin
Bloggin is a full feature blog website that has user profiles and posts. The platform is in many ways a space where different authors can sign up and share their ideas with the world in a raw form.

It is a full-stack web application employing **MongoDB, Mongoose, Embedded JavaScript, JWT, HTML and CSS** for its functionality.


<img width="947" alt="Screenshot 2023-10-16 005016" src="https://github.com/uditsathe/Bloggin/assets/102481732/9917eeb4-87e8-45e6-9bf2-8f14e153c446">

## 1. The Backend
![Untitled design](https://github.com/uditsathe/Bloggin/assets/102481732/6fbc88c7-380d-42a3-ac7c-c7d65300222d)

### CRUD operations
The project is constructed using Mongo DB with the help of Mongoose.
It has in its functionality, leveraged the CRUD operations, namely-
* **Create**- Upon registering of new users and publishing of new blog posts.
* **Read**- Blog posts are fetched according to no. of views and recency from the **Posts** collection and users are fetched from the **Users** collection of the **BLOGGINdatabase**
* **Update**- Upon updation of blog posts or user account information update is performed on the respective items in their particular collections
* **Delete**- Deletion of posts and accounts from the database is doable through edit post and account settings pages respectively.

### Authentication
In the website backend, an elaborate system of user authenticated using **JWT (JSON Web Token)**. It has been deployed, in various processes like editting and composing of blog posts, editing account and accessing user credentials and deleting any post.

The implementation has 3 key steps to ensure security-
* Salt unique to individual user is saved on the database
* User passwords are saved upon encryption using JWT
* Upon request to login password is decrypted and only then compared


## 2. The Frontend

### Dynamic gradient backgrounds
![Untitled video - Made with Clipchamp](https://github.com/uditsathe/Bloggin/assets/102481732/683b28db-b5ad-4507-9f86-02807630a5a9)

### Embedded Dynamic Cards
<img width="946" alt="Screenshot 2023-10-16 201444" src="https://github.com/uditsathe/Bloggin/assets/102481732/c248fc51-760a-4da7-b5de-e0be8151cef6">

### Embedded Post Thumbnails
<img width="948" alt="Screenshot 2023-10-16 005509" src="https://github.com/uditsathe/Bloggin/assets/102481732/ccfd67f0-02f3-41a6-a38e-1989c04d40a9">

## 3. Project key features in a nutshell 
![User Authentication](https://github.com/uditsathe/Bloggin/assets/102481732/0a486d78-ea25-4c26-9aba-daf5cccb4b97)
