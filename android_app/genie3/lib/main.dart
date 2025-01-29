import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  // Główna aplikacja z dwoma ekranami: rejestracja i logowanie.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rejestracja / Logowanie',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: HomeScreen(), // Strona początkowa z wyborem akcji
    );
  }
}

class HomeScreen extends StatelessWidget {
  // Prosty ekran umożliwiający wybór rejestracji lub logowania
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Witaj w aplikacji'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            ElevatedButton(
              child: Text('Rejestracja'),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => RegisterPage()),
                );
              },
            ),
            SizedBox(height: 20),
            ElevatedButton(
              child: Text('Logowanie'),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => LoginPage()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class RegisterPage extends StatefulWidget {
  @override
  _RegisterPageState createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  // Kontrolery pól formularza
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController firstNameController = TextEditingController();
  final TextEditingController lastNameController = TextEditingController();
  final TextEditingController dobController = TextEditingController();

  bool isLoading = false;

  Future<void> registerUser() async {
    setState(() {
      isLoading = true;
    });
    // Adres endpointu rejestracji
    final url = Uri.parse("http://10.0.2.2:8080/api/user/register");

    // Utworzenie danych w formacie JSON (przykładowe dane)
    final Map<String, dynamic> userData = {
      "username": usernameController.text.trim(),
      "password": passwordController.text.trim(),
      "email": emailController.text.trim(),
      "first_name": firstNameController.text.trim(),
      "last_name": lastNameController.text.trim(),
      // Przyjmujemy, że użytkownik wpisze datę w formacie ISO 8601, np. "1990-01-01T00:00:00Z"
      "date_of_birth": dobController.text.trim(),
    };

    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(userData),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Zarejestrowano poprawnie
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Rejestracja udana!')),
        );
      } else {
        // Błąd rejestracji
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Błąd rejestracji: ${response.body}')),
        );
      }
    } catch (e) {
      // Obsługa błędów
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Wystąpił błąd: $e')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    emailController.dispose();
    firstNameController.dispose();
    lastNameController.dispose();
    dobController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Rejestracja'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: ListView(
          children: [
            TextField(
              controller: usernameController,
              decoration: InputDecoration(labelText: "Nazwa użytkownika"),
            ),
            TextField(
              controller: passwordController,
              decoration: InputDecoration(labelText: "Hasło"),
              obscureText: true,
            ),
            TextField(
              controller: emailController,
              decoration: InputDecoration(labelText: "Email"),
            ),
            TextField(
              controller: firstNameController,
              decoration: InputDecoration(labelText: "Imię"),
            ),
            TextField(
              controller: lastNameController,
              decoration: InputDecoration(labelText: "Nazwisko"),
            ),
            TextField(
              controller: dobController,
              decoration: InputDecoration(
                labelText: "Data urodzenia (np. 1990-01-01T00:00:00Z)",
              ),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: isLoading ? null : registerUser,
              child: isLoading
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text("Zarejestruj się"),
            )
          ],
        ),
      ),
    );
  }
}

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  // Kontrolery pól logowania
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  bool isLoading = false;

  Future<void> loginUser() async {
    setState(() {
      isLoading = true;
    });
    // Adres endpointu logowania
    final url = Uri.parse("http://10.0.2.2:8080/api/user/login");

    // Dane logowania (tylko username i hasło)
    final Map<String, dynamic> loginData = {
      "username": usernameController.text.trim(),
      "password": passwordController.text.trim(),
    };

    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(loginData),
      );

      if (response.statusCode == 200) {
        // Poprawne logowanie
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Logowanie udane!')),
        );
      } else {
        // Błąd logowania
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Błąd logowania: ${response.body}')),
        );
      }
    } catch (e) {
      // Obsługa błędów
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Wystąpił błąd: $e')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Logowanie'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: ListView(
          children: [
            TextField(
              controller: usernameController,
              decoration: InputDecoration(labelText: "Nazwa użytkownika"),
            ),
            TextField(
              controller: passwordController,
              decoration: InputDecoration(labelText: "Hasło"),
              obscureText: true,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: isLoading ? null : loginUser,
              child: isLoading
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text("Zaloguj się"),
            )
          ],
        ),
      ),
    );
  }
}
