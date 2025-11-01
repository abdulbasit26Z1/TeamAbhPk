<?php
// ====== DATABASE CONNECTION ======
$host = "localhost";   // usually 'localhost'
$user = "root";        // phpMyAdmin username
$pass = "";            // phpMyAdmin password (empty by default)
$dbname = "testdb";    // create this database in phpMyAdmin

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// ====== CREATE TABLE IF NOT EXISTS ======
$conn->query("CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100)
)");

// ====== CREATE RECORD ======
if (isset($_POST['create'])) {
  $name = $_POST['name'];
  $email = $_POST['email'];
  $conn->query("INSERT INTO users (name, email) VALUES ('$name', '$email')");
  echo "<p style='color:green;'>User added successfully!</p>";
}

// ====== DELETE RECORD ======
if (isset($_GET['delete'])) {
  $id = $_GET['delete'];
  $conn->query("DELETE FROM users WHERE id=$id");
  echo "<p style='color:red;'>User deleted!</p>";
}

// ====== UPDATE RECORD ======
if (isset($_POST['update'])) {
  $id = $_POST['id'];
  $name = $_POST['name'];
  $email = $_POST['email'];
  $conn->query("UPDATE users SET name='$name', email='$email' WHERE id=$id");
  echo "<p style='color:blue;'>User updated!</p>";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Simple PHP CRUD</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    table { border-collapse: collapse; width: 60%; margin-top: 20px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #eee; }
    input, button { padding: 5px; margin-top: 5px; }
  </style>
</head>
<body>

<h2>Add New User</h2>
<form method="post">
  <input type="text" name="name" placeholder="Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <button type="submit" name="create">Add</button>
</form>

<hr>

<h2>All Users</h2>
<table>
  <tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr>
  <?php
  $result = $conn->query("SELECT * FROM users");
  if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
      echo "<tr>
              <td>{$row['id']}</td>
              <td>{$row['name']}</td>
              <td>{$row['email']}</td>
              <td>
                <a href='?edit={$row['id']}'>Edit</a> | 
                <a href='?delete={$row['id']}'>Delete</a>
              </td>
            </tr>";
    }
  } else {
    echo "<tr><td colspan='4'>No records found</td></tr>";
  }
  ?>
</table>

<?php
// ====== SHOW UPDATE FORM ======
if (isset($_GET['edit'])) {
  $id = $_GET['edit'];
  $res = $conn->query("SELECT * FROM users WHERE id=$id");
  $row = $res->fetch_assoc();
  echo "
  <hr>
  <h2>Edit User</h2>
  <form method='post'>
    <input type='hidden' name='id' value='{$row['id']}'>
    <input type='text' name='name' value='{$row['name']}' required>
    <input type='email' name='email' value='{$row['email']}' required>
    <button type='submit' name='update'>Update</button>
  </form>";
}
?>

</body>
</html>
