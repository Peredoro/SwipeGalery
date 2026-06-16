# Português

# Swipe Gallery

O Swipe Gallery é um aplicativo de gerenciamento de mídias focado em Android, desenvolvido com Capacitor.
O aplicativo utiliza a API nativa MediaStore do Android para localizar imagens e vídeos armazenados no dispositivo, permitindo visualizar, organizar, mover, restaurar e excluir arquivos de mídia.

O projeto foi desenvolvido para funcionar de forma semelhante às galerias nativas do Android, porém com uma interface e sistema de gerenciamento personalizados.

## Funcionalidades

* Escaneamento de imagens e vídeos do dispositivo utilizando MediaStore
* Exibição de mídias em uma galeria personalizada
* Suporte para visualização de imagens e vídeos
* Sistema de lixeira personalizado
* Restauração de arquivos removidos
* Exclusão permanente de mídias
* Integração com plugin nativo Android
* Aplicação mobile baseada em Capacitor
* Suporte a permissões de armazenamento Android
* Filtragem automática de imagens e vídeos
* Carregamento dinâmico da galeria

## Tecnologias Utilizadas

* JavaScript
* Capacitor
* Plugins nativos Android
* Java
* Android MediaStore API
* Capacitor Filesystem API

## Estrutura do Projeto

```text id="d9xot0"
android/
src/
components/
services/
plugins/
```

## Funcionamento da Aplicação

A aplicação se comunica diretamente com o MediaStore do Android através de um plugin nativo Capacitor chamado `MediaScannerPlugin`.

### Escaneamento de Mídias

O plugin acessa:

```java id="s8qf6f"
MediaStore.Images.Media.EXTERNAL_CONTENT_URI
MediaStore.Video.Media.EXTERNAL_CONTENT_URI
```

O plugin realiza a leitura das mídias armazenadas no dispositivo e retorna:

* Caminho do arquivo
* Nome do arquivo
* Tipo MIME
* Tamanho do arquivo
* Data de modificação
* Tipo da mídia

### Renderização da Galeria

Após o escaneamento:

1. O plugin nativo Android retorna os metadados das mídias
2. O Capacitor converte os caminhos dos arquivos para URLs compatíveis com WebView
3. O frontend renderiza as mídias dinamicamente
4. Imagens e vídeos são organizados automaticamente

### Sistema de Lixeira

Ao invés de excluir imediatamente os arquivos, o aplicativo move as mídias para:

```text id="z4v9um"
DCIM/Camera/Lixeira_Swipe
```

Um arquivo de metadados armazena o caminho original da mídia:

```text id="64fsvs"
.trash_metadata.json
```

Isso permite restaurar os arquivos posteriormente para a pasta original.

## Instalação

### Requisitos

* Node.js
* Android Studio
* Java JDK 17+
* Android SDK
* Capacitor CLI

## Clonar o Repositório

```bash id="ly32tr"
git clone https://github.com/seu-repositorio/swipe-gallery.git
cd swipe-gallery
```

## Instalar Dependências

```bash id="a9h4d9"
npm install
```

## Gerar Build Web

```bash id="7d5j2y"
npm run build
```

## Sincronizar Capacitor

```bash id="jlwm8n"
npx cap sync android
```

## Abrir no Android Studio

```bash id="y0m86o"
npx cap open android
```

## Executar o Aplicativo

Execute o projeto diretamente pelo Android Studio em:

* Dispositivo Android físico
* Emulador Android

## Permissões Android

O aplicativo solicita permissões diferentes dependendo da versão do Android.

### Android 13+

```xml id="6fh0rl"
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
```

### Android 12 ou inferior

```xml id="fq5z5l"
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### Acesso Completo ao Armazenamento (Opcional)

Para operações avançadas de arquivos:

```xml id="m5c4um"
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
```

## Registro do Plugin Nativo

O plugin nativo é registrado em:

```java id="ozshjv"
MainActivity.java
```

```java id="4n7rc9"
registerPlugin(MediaScannerPlugin.class);
```

## Uso do Plugin Capacitor

```javascript id="6h4bjl"
const result = await MediaScanner.scanMediaFiles();
```

Estrutura retornada:

```javascript id="c8vjmb"
{
  files: [],
  debug_total: number
}
```

## Gerar APK

No Android Studio:

```text id="kgm8fz"
Build > Build APK(s)
```

Ou utilizando Gradle:

```bash id="ejh35g"
cd android
./gradlew assembleDebug
```

## Melhorias Futuras

* Cache de mídias
* Otimização de thumbnails
* Agrupamento por pastas
* Scroll infinito
* Sistema de busca
* Favoritos
* Sincronização em nuvem
* Observador de indexação de mídias
* Seleção múltipla
* Suporte a álbuns

## Licença

Este projeto está disponível para uso educacional e pessoal.


# English

# Swipe Gallery

Swipe Gallery is an Android-focused media management application built with Capacitor.
The application scans the device media library using Android MediaStore APIs and allows users to view, organize, move, restore, and permanently delete images and videos.

The app was designed to work similarly to native Android gallery applications while maintaining a custom interface and media management workflow.

## Features

* Scan all device images and videos using Android MediaStore
* Display media files in a custom gallery interface
* Video and image preview support
* Custom trash system
* Restore deleted files
* Permanently delete media files
* Android native plugin integration
* Capacitor-based mobile application
* Support for Android storage permissions
* Media filtering for images and videos
* Real-time gallery loading

## Technologies Used

* JavaScript
* Capacitor
* Android Native Plugins
* Java
* Android MediaStore API
* Capacitor Filesystem API

## Project Structure

```text
android/
src/
components/
services/
plugins/
```

## How the Application Works

The application communicates directly with Android MediaStore through a custom native Capacitor plugin called `MediaScannerPlugin`.

### Media Scanning

The plugin accesses:

```java
MediaStore.Images.Media.EXTERNAL_CONTENT_URI
MediaStore.Video.Media.EXTERNAL_CONTENT_URI
```

The plugin scans device media files and returns:

* File path
* File name
* MIME type
* File size
* Modification date
* Media type

### Gallery Rendering

After scanning:

1. Native Android plugin returns media metadata
2. Capacitor converts native file paths to web-compatible URLs
3. The frontend renders media previews dynamically
4. Videos and images are categorized automatically

### Trash System

Instead of immediately deleting files, the application moves them to:

```text
DCIM/Camera/Lixeira_Swipe
```

A metadata file stores the original file location:

```text
.trash_metadata.json
```

This allows files to be restored to their original folder later.

## Installation

### Requirements

* Node.js
* Android Studio
* Java JDK 17+
* Android SDK
* Capacitor CLI

## Clone the Repository

```bash
git clone https://github.com/your-repository/swipe-gallery.git
cd swipe-gallery
```

## Install Dependencies

```bash
npm install
```

## Build the Web Application

```bash
npm run build
```

## Sync Capacitor

```bash
npx cap sync android
```

## Open Android Studio

```bash
npx cap open android
```

## Run the Application

Run the project directly from Android Studio on:

* Physical Android device
* Android emulator

## Android Permissions

The application requests the following permissions depending on Android version.

### Android 13+

```xml
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
```

### Android 12 and Lower

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### Optional Full Storage Access

For advanced file operations:

```xml
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
```

## Native Plugin Registration

The native plugin is registered inside:

```java
MainActivity.java
```

```java
registerPlugin(MediaScannerPlugin.class);
```

## Capacitor Plugin Usage

```javascript
const result = await MediaScanner.scanMediaFiles();
```

Returned structure:

```javascript
{
  files: [],
  debug_total: number
}
```

## Build APK

Inside Android Studio:

```text
Build > Build APK(s)
```

Or using Gradle:

```bash
cd android
./gradlew assembleDebug
```

## Future Improvements

* Media caching
* Thumbnail generation optimization
* Folder grouping
* Infinite scroll
* Search system
* Media favorites
* Cloud synchronization
* Media indexing observer
* Multi-selection actions
* Album support

## License

This project is available for educational and personal use.
