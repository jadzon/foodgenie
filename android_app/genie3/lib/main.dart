import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mime/mime.dart'; // Potrzebne do walidacji typu pliku

void main() {
  runApp(MyApp());
}

/// **Modele Danych**

/// Model reprezentujący pojedynczy składnik
class Ingredient {
  final String name;
  final int calories;

  Ingredient({required this.name, required this.calories});

  factory Ingredient.fromJson(Map<String, dynamic> json) {
    return Ingredient(
      name: json['name'],
      calories: json['calories'],
    );
  }
}

/// Model reprezentujący odpowiedź z serwera po przesłaniu zdjęcia
class UploadResponse {
  final List<Ingredient> ingredients;
  final int totalCalories;

  UploadResponse({required this.ingredients, required this.totalCalories});

  factory UploadResponse.fromJson(Map<String, dynamic> json) {
    var ingredientsJson = json['ingredients'] as List;
    List<Ingredient> ingredientsList =
    ingredientsJson.map((i) => Ingredient.fromJson(i)).toList();

    return UploadResponse(
      ingredients: ingredientsList,
      totalCalories: json['calories'],
    );
  }
}

/// **Główna Klasa Aplikacji**

class MyApp extends StatelessWidget {
  final Color navyColor = const Color(0xFF0C1A3B);
  final Color pinkColor = const Color(0xFFFF007B);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rejestracja / Logowanie',
      theme: ThemeData(
        scaffoldBackgroundColor: navyColor,
        textTheme: TextTheme(
          bodyLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.normal, fontSize: 16),
          bodyMedium: TextStyle(color: Colors.white, fontWeight: FontWeight.normal, fontSize: 14),
          headlineLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 32),
          headlineMedium: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
          titleMedium: TextStyle(color: Colors.white70, fontWeight: FontWeight.w500, fontSize: 18), // Zamiast subtitle1
          labelSmall: TextStyle(color: Colors.white60, fontSize: 12), // Zamiast caption
          // Dodaj inne style według potrzeb
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ButtonStyle(
            foregroundColor: MaterialStateProperty.all(pinkColor),
            backgroundColor: MaterialStateProperty.all(Colors.transparent),
            side: MaterialStateProperty.all(BorderSide(color: pinkColor)),
            shape: MaterialStateProperty.all(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.0),
              ),
            ),
          ),
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: navyColor,
          titleTextStyle: TextStyle(color: pinkColor, fontSize: 20),
          iconTheme: IconThemeData(color: pinkColor),
        ),
      ),
      home: HomeScreen(),
    );
  }
}

/// **Ekran Główny**

class HomeScreen extends StatelessWidget {
  // Ekran główny, na którym wstawimy logo oraz przyciski „Rejestracja” i „Logowanie” obok siebie
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Foodgenie'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            // LOGO
            Image.asset(
              'assets/logo/logo_genie.png',
              width: 200, // możesz dostosować rozmiar
            ),
            SizedBox(height: 30),
            // Rząd z przyciskami obok siebie
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding:
                    EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                    textStyle: TextStyle(fontSize: 18),
                  ),
                  child: Text('Rejestracja'),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => RegisterPage()),
                    );
                  },
                ),
                SizedBox(width: 20), // odstęp między przyciskami
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding:
                    EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                    textStyle: TextStyle(fontSize: 18),
                  ),
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
          ],
        ),
      ),
    );
  }
}

/// **Ekran Rejestracji**

class RegisterPage extends StatefulWidget {
  @override
  _RegisterPageState createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
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
    final url = Uri.parse("http://10.0.2.2:8080/api/user/register");
    final Map<String, dynamic> userData = {
      "username": usernameController.text.trim(),
      "password": passwordController.text.trim(),
      "email": emailController.text.trim(),
      "first_name": firstNameController.text.trim(),
      "last_name": lastNameController.text.trim(),
      "date_of_birth": dobController.text.trim(),
    };

    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(userData),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Rejestracja udana!')),
        );
        Navigator.pop(context);
      } else {
        final responseData = jsonDecode(response.body);
        final errorMessage = responseData['message'] ?? 'Błąd rejestracji';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Błąd rejestracji: $errorMessage')),
        );
      }
    } catch (e) {
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
              decoration: InputDecoration(
                labelText: "Nazwa użytkownika",
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink, width: 2.0),
                ),
              ),
              style: Theme.of(context).textTheme.bodyLarge, // Zamiast bodyText1
            ),
            SizedBox(height: 10),
            TextField(
              controller: passwordController,
              decoration: InputDecoration(
                labelText: "Hasło",
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink, width: 2.0),
                ),
              ),
              obscureText: true,
              style: Theme.of(context).textTheme.bodyLarge, // Zamiast bodyText1
            ),
            SizedBox(height: 10),
            TextField(
              controller: emailController,
              decoration: InputDecoration(
                labelText: "Email",
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink, width: 2.0),
                ),
              ),
              style: Theme.of(context).textTheme.bodyLarge, // Zamiast bodyText1
            ),
            SizedBox(height: 10),
            TextField(
              controller: firstNameController,
              decoration: InputDecoration(
                labelText: "Imię",
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink, width: 2.0),
                ),
              ),
              style: Theme.of(context).textTheme.bodyLarge, // Zamiast bodyText1
            ),
            SizedBox(height: 10),
            TextField(
              controller: lastNameController,
              decoration: InputDecoration(
                labelText: "Nazwisko",
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink, width: 2.0),
                ),
              ),
              style: Theme.of(context).textTheme.bodyLarge, // Zamiast bodyText1
            ),
            SizedBox(height: 10),
            TextField(
              controller: dobController,
              decoration: InputDecoration(
                labelText: "Data urodzenia (np. 1990-01-01T00:00:00Z)",
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink, width: 2.0),
                ),
              ),
              style: Theme.of(context).textTheme.bodyLarge, // Zamiast bodyText1
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: isLoading ? null : registerUser,
              child: isLoading
                  ? SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.0),
              )
                  : Text("Zarejestruj się"),
            )
          ],
        ),
      ),
    );
  }
}

/// **Ekran Logowania**

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  bool isLoading = false;

  final FlutterSecureStorage secureStorage = FlutterSecureStorage();

  Future<void> loginUser() async {
    setState(() {
      isLoading = true;
    });
    final url = Uri.parse("http://10.0.2.2:8080/api/user/login");
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
        final responseData = jsonDecode(response.body);
        final accessToken = responseData['data']['access_token'];
        final refreshToken = responseData['data']['refresh_token'];

        await secureStorage.write(key: 'access_token', value: accessToken);
        await secureStorage.write(key: 'refresh_token', value: refreshToken);
        await secureStorage.write(key: 'username', value: usernameController.text.trim()); // Przechowywanie username

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Logowanie udane!')),
        );

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => HomePage()),
        );
      } else {
        final responseData = jsonDecode(response.body);
        final errorMessage = responseData['message'] ?? 'Błąd logowania';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Błąd logowania: $errorMessage')),
        );
      }
    } catch (e) {
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
              decoration: InputDecoration(
                labelText: "Nazwa użytkownika",
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink, width: 2.0),
                ),
              ),
              style: Theme.of(context).textTheme.bodyLarge, // Zamiast bodyText1
            ),
            SizedBox(height: 10),
            TextField(
              controller: passwordController,
              decoration: InputDecoration(
                labelText: "Hasło",
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.pink, width: 2.0),
                ),
              ),
              obscureText: true,
              style: Theme.of(context).textTheme.bodyLarge, // Zamiast bodyText1
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: isLoading ? null : loginUser,
              child: isLoading
                  ? SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.0),
              )
                  : Text("Zaloguj się"),
            )
          ],
        ),
      ),
    );
  }
}

/// **Ekran Po Zalogowaniu**

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final FlutterSecureStorage secureStorage = FlutterSecureStorage();

  String? username; // Przechowywanie nazwy użytkownika

  @override
  void initState() {
    super.initState();
    loadUsername(); // Ładowanie nazwy użytkownika
  }

  /// Funkcja do ładowania nazwy użytkownika z magazynu
  Future<void> loadUsername() async {
    String? storedUsername = await secureStorage.read(key: 'username');
    setState(() {
      username = storedUsername;
    });
  }

  /// Funkcja wylogowująca użytkownika
  Future<void> logout(BuildContext context) async {
    await secureStorage.delete(key: 'access_token');
    await secureStorage.delete(key: 'refresh_token');
    await secureStorage.delete(key: 'username'); // Usuwanie nazwy użytkownika
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => HomeScreen()),
    );
  }

  /// Funkcja nawigująca do ekranu przesyłania zdjęcia
  void navigateToUploadImage() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => UploadImagePage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(username != null ? "Witaj, $username" : "Strona Główna"), // Wyświetlanie nazwy użytkownika
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () => logout(context),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            ElevatedButton(
              child: Text("Prześlij Zdjęcie"),
              onPressed: navigateToUploadImage,
            ),
          ],
        ),
      ),
    );
  }
}

/// **Ekran Przesyłania Zdjęcia**

class UploadImagePage extends StatefulWidget {
  @override
  _UploadImagePageState createState() => _UploadImagePageState();
}

class _UploadImagePageState extends State<UploadImagePage> {
  final FlutterSecureStorage secureStorage = FlutterSecureStorage();
  File? _selectedImage;
  bool isLoading = false;
  List<Ingredient>? ingredients;
  int? calories;

  final ImagePicker _picker = ImagePicker();

  /// Funkcja pozwalająca użytkownikowi wybrać zdjęcie z galerii lub aparatu
  Future<void> pickImage() async {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: Icon(Icons.photo_library, color: Colors.pink),
              title: Text('Galeria'),
              onTap: () async {
                Navigator.pop(context);
                final XFile? image = await _picker.pickImage(
                  source: ImageSource.gallery,
                  maxWidth: 800,
                  maxHeight: 800,
                );

                if (image != null) {
                  setState(() {
                    _selectedImage = File(image.path);
                    ingredients = null;
                    calories = null;
                  });
                }
              },
            ),
            ListTile(
              leading: Icon(Icons.camera_alt, color: Colors.pink),
              title: Text('Aparat'),
              onTap: () async {
                Navigator.pop(context);
                final XFile? image = await _picker.pickImage(
                  source: ImageSource.camera,
                  maxWidth: 800,
                  maxHeight: 800,
                );

                if (image != null) {
                  setState(() {
                    _selectedImage = File(image.path);
                    ingredients = null;
                    calories = null;
                  });
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  /// Funkcja przesyłająca wybrane zdjęcie na serwer i przetwarzająca odpowiedź
  Future<void> uploadImage() async {
    if (_selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Proszę wybrać zdjęcie do przesłania.')),
      );
      return;
    }

    // Sprawdzenie rozmiaru pliku (maksymalnie 5MB)
    final bytes = await _selectedImage!.length();
    final kb = bytes / 1024;
    final mb = kb / 1024;
    if (mb > 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Plik jest za duży. Maksymalny rozmiar to 5MB.')),
      );
      return;
    }

    // Sprawdzenie typu pliku
    final mimeType = lookupMimeType(_selectedImage!.path);
    if (mimeType != 'image/jpeg' && mimeType != 'image/png') {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Nieobsługiwany typ pliku. Wybierz JPEG lub PNG.')),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    String? accessToken = await secureStorage.read(key: 'access_token');
    if (accessToken == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Brak tokenu dostępu. Zaloguj się ponownie.')),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => LoginPage()),
      );
      return;
    }

    final uri = Uri.parse("http://10.0.2.2:8080/api/image");
    final request = http.MultipartRequest('POST', uri);
    request.headers['Authorization'] = 'Bearer $accessToken';
    request.files.add(
      await http.MultipartFile.fromPath(
        'image',
        _selectedImage!.path,
      ),
    );

    try {
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final uploadResponse = UploadResponse.fromJson(responseData);
        setState(() {
          ingredients = uploadResponse.ingredients;
          calories = uploadResponse.totalCalories;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Zdjęcie zostało przesłane pomyślnie!')),
        );
      } else {
        final responseData = jsonDecode(response.body);
        final errorMessage = responseData['message'] ?? 'Błąd przesyłania zdjęcia';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Błąd: $errorMessage')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Wystąpił błąd: $e')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  /// Widget wyświetlający wybrane zdjęcie lub komunikat
  Widget _buildImageDisplay() {
    if (_selectedImage != null) {
      return Image.file(
        _selectedImage!,
        width: 200,
        height: 200,
        fit: BoxFit.cover,
      );
    } else {
      return Text(
        'Nie wybrano żadnego zdjęcia.',
        style: Theme.of(context).textTheme.bodyLarge,
      );
    }
  }

  /// Widget wyświetlający listę składników i całkowitą liczbę kalorii
  Widget _buildResponseDisplay() {
    if (ingredients != null && calories != null) {
      return Expanded(
        child: ListView.builder(
          itemCount: ingredients!.length + 1, // +1 dla całkowitych kalorii
          itemBuilder: (context, index) {
            if (index < ingredients!.length) {
              final ingredient = ingredients![index];
              return ListTile(
                leading: Icon(Icons.food_bank, color: Colors.pink),
                title: Text(
                  ingredient.name,
                  style: TextStyle(color: Colors.white),
                ),
                trailing: Text(
                  '${ingredient.calories} kcal',
                  style: TextStyle(color: Colors.white),
                ),
              );
            } else {
              return ListTile(
                leading: Icon(Icons.local_fire_department, color: Colors.red),
                title: Text(
                  'Całkowite Kalorie',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                trailing: Text(
                  '$calories kcal',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              );
            }
          },
        ),
      );
    } else {
      return Container();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Prześlij Zdjęcie'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildImageDisplay(),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: isLoading ? null : pickImage,
              child: Text('Wybierz Zdjęcie'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: isLoading ? null : uploadImage,
              child: isLoading
                  ? SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.0),
              )
                  : Text('Prześlij Zdjęcie'),
            ),
            SizedBox(height: 20),
            _buildResponseDisplay(),
          ],
        ),
      ),
    );
  }
}
