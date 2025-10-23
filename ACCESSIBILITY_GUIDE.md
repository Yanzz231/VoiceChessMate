# Panduan Accessibility ChessMate

Dokumentasi ini menjelaskan cara menggunakan fitur accessibility di aplikasi ChessMate untuk mendukung pengguna tunanetra dan memastikan aplikasi dapat digunakan oleh semua orang.

## Fitur Utama

### 1. Text-to-Speech (TTS)
- Semua elemen UI akan dibacakan ketika disentuh
- Menggunakan bahasa Indonesia (id-ID)
- Otomatis aktif jika Voice Mode diaktifkan di onboarding

### 2. React Native Accessibility API
- `accessibilityLabel`: Label yang dibaca oleh screen reader
- `accessibilityHint`: Petunjuk tambahan tentang fungsi elemen
- `accessibilityRole`: Peran elemen (button, text, image, header, dll)
- `AccessibilityInfo.announceForAccessibility()`: Announcement otomatis untuk modal/alert

### 3. WCAG 2.1 AA Compliant
- Ukuran touch target minimum 56x56px
- Kontras warna memenuhi standar WCAG
- Font size yang dapat dibaca

## Komponen Accessibility

### AccessibleText
Komponen text yang otomatis support TTS ketika disentuh.

```tsx
import { AccessibleText } from '@/components/accessibility';

<AccessibleText
  style={{ fontSize: 16, color: '#000' }}
  accessibilityRole="header"
  accessibilityHint="Judul halaman"
>
  Welcome to ChessMate
</AccessibleText>
```

**Props:**
- `children`: Konten text
- `accessibilityHint`: Petunjuk tambahan (optional)
- `accessibilityRole`: Peran elemen (default: 'text')
- `customAnnouncement`: Custom text yang dibaca (optional)
- `onPress`: Callback ketika disentuh (optional)
- Semua props dari `<Text>` component

### AccessibleCard
Komponen wrapper untuk card yang support accessibility.

```tsx
import { AccessibleCard } from '@/components/accessibility';

<AccessibleCard
  accessibilityLabel="Pilih mode anak. Untuk usia di bawah 13 tahun"
  accessibilityHint="Ketuk dua kali untuk memilih"
  onPress={() => selectChildMode()}
  style={{ padding: 20, backgroundColor: '#fff' }}
>
  <Text>Child Mode</Text>
  <Text>Under 13 years old</Text>
</AccessibleCard>
```

**Props:**
- `children`: Konten card
- `accessibilityLabel`: Label yang dibaca (required)
- `accessibilityHint`: Petunjuk tambahan (optional)
- `accessibilityRole`: Peran elemen (default: 'button')
- `onPress`: Callback ketika disentuh
- `disabled`: Status disabled (default: false)
- Semua props dari `<View>` component

### AccessibleImage
Komponen image yang support accessibility dengan deskripsi.

```tsx
import { AccessibleImage } from '@/components/accessibility';

<AccessibleImage
  source={require('@/assets/chess-icon.png')}
  accessibilityLabel="Icon papan catur"
  accessibilityHint="Ilustrasi permainan catur"
  customAnnouncement="Gambar papan catur dengan bidak hitam dan putih"
  style={{ width: 100, height: 100 }}
/>
```

**Props:**
- `accessibilityLabel`: Label gambar (required)
- `accessibilityHint`: Petunjuk tambahan (optional)
- `customAnnouncement`: Custom announcement (optional)
- `onPress`: Callback jika gambar bisa diklik (optional)
- Semua props dari `<Image>` component

## Alert Modals

### AccessibleAlert
Alert modern dengan full accessibility support dan animasi smooth.

```tsx
import { AccessibleAlert } from '@/components/modals/AccessibleAlert';
import { useAccessibleAlert } from '@/hooks/useAccessibleAlert';

function MyComponent() {
  const { alertConfig, showError, showSuccess, showConfirm, hideAlert } = useAccessibleAlert();

  const handleError = () => {
    showError(
      'Login Gagal',
      'Username atau password salah. Silakan coba lagi.'
    );
  };

  const handleSuccess = () => {
    showSuccess(
      'Berhasil!',
      'Data berhasil disimpan.'
    );
  };

  const handleConfirm = () => {
    showConfirm(
      'Hapus Data?',
      'Apakah Anda yakin ingin menghapus data ini?',
      () => console.log('Confirmed'),
      () => console.log('Cancelled'),
      'Hapus',
      'Batal'
    );
  };

  return (
    <>
      {/* Your UI */}

      <AccessibleAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryButtonText={alertConfig.primaryButtonText}
        secondaryButtonText={alertConfig.secondaryButtonText}
        onPrimaryPress={alertConfig.onPrimaryPress}
        onSecondaryPress={alertConfig.onSecondaryPress}
      />
    </>
  );
}
```

**Alert Types:**
- `success`: Hijau, untuk operasi berhasil
- `error`: Merah, untuk error/kesalahan
- `warning`: Orange, untuk peringatan
- `info`: Kuning, untuk informasi
- `confirm`: Kuning, untuk konfirmasi dengan 2 tombol

**useAccessibleAlert Hook Methods:**
- `showSuccess(title, message, onPress?)`: Tampilkan success alert
- `showError(title, message, onPress?)`: Tampilkan error alert
- `showWarning(title, message, onPress?)`: Tampilkan warning alert
- `showInfo(title, message, onPress?)`: Tampilkan info alert
- `showConfirm(title, message, onConfirm, onCancel?, confirmText?, cancelText?)`: Tampilkan konfirmasi
- `hideAlert()`: Tutup alert

## Best Practices

### 1. Selalu Gunakan accessibilityLabel
```tsx
// GOOD
<TouchableOpacity
  accessibilityLabel="Tombol masuk"
  accessibilityRole="button"
>
  <Text>Login</Text>
</TouchableOpacity>

// BAD
<TouchableOpacity>
  <Text>Login</Text>
</TouchableOpacity>
```

### 2. Berikan accessibilityHint yang Jelas
```tsx
// GOOD
<TouchableOpacity
  accessibilityLabel="Simpan perubahan"
  accessibilityHint="Ketuk dua kali untuk menyimpan perubahan profil Anda"
>
  <Text>Save</Text>
</TouchableOpacity>

// BAD
<TouchableOpacity
  accessibilityLabel="Simpan"
>
  <Text>Save</Text>
</TouchableOpacity>
```

### 3. Gunakan accessibilityRole yang Tepat
```tsx
// Header
<Text accessibilityRole="header">Judul Halaman</Text>

// Button
<TouchableOpacity accessibilityRole="button">

// Link
<TouchableOpacity accessibilityRole="link">

// Image
<Image accessibilityRole="image" accessibilityLabel="Deskripsi gambar">

// Text
<Text accessibilityRole="text">
```

### 4. Grup Elemen yang Berhubungan
```tsx
// GOOD - Satu announcement untuk seluruh card
<AccessibleCard
  accessibilityLabel="Mode Anak. Untuk usia di bawah 13 tahun. Status: Terpilih"
>
  <Text>Child Mode</Text>
  <Text>Under 13 years old</Text>
  <Text>Selected</Text>
</AccessibleCard>

// BAD - Tiga announcement terpisah
<View>
  <AccessibleText>Child Mode</AccessibleText>
  <AccessibleText>Under 13 years old</AccessibleText>
  <AccessibleText>Selected</AccessibleText>
</View>
```

### 5. Gunakan importantForAccessibility
```tsx
// Parent accessible, children tidak perlu
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Complete label"
>
  <Text importantForAccessibility="no">Part 1</Text>
  <Text importantForAccessibility="no">Part 2</Text>
</TouchableOpacity>
```

### 6. Announce Dynamic Changes
```tsx
import { AccessibilityInfo } from 'react-native';

// Ketika ada perubahan penting
const handleSave = async () => {
  await saveData();
  AccessibilityInfo.announceForAccessibility('Data berhasil disimpan');
};
```

### 7. Test dengan Screen Reader
- **iOS**: Aktifkan VoiceOver (Settings > Accessibility > VoiceOver)
- **Android**: Aktifkan TalkBack (Settings > Accessibility > TalkBack)

## Contoh Implementasi Lengkap

```tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { AccessibleText, AccessibleCard, AccessibleImage } from '@/components/accessibility';
import { useAccessibleAlert } from '@/hooks/useAccessibleAlert';
import { AccessibleAlert } from '@/components/modals/AccessibleAlert';

export default function AccessibleScreen() {
  const { alertConfig, showSuccess, hideAlert } = useAccessibleAlert();

  const handleCardPress = () => {
    showSuccess('Terpilih', 'Mode anak berhasil dipilih');
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {/* Header */}
      <AccessibleText
        style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}
        accessibilityRole="header"
      >
        Pilih Mode Anda
      </AccessibleText>

      {/* Description */}
      <AccessibleText
        style={{ fontSize: 16, color: '#666', marginBottom: 20 }}
        accessibilityHint="Deskripsi halaman"
      >
        Pilih mode yang sesuai dengan usia Anda
      </AccessibleText>

      {/* Image */}
      <AccessibleImage
        source={require('@/assets/child-icon.png')}
        accessibilityLabel="Icon anak-anak"
        style={{ width: 100, height: 100, alignSelf: 'center', marginBottom: 20 }}
      />

      {/* Interactive Card */}
      <AccessibleCard
        accessibilityLabel="Mode Anak. Untuk usia di bawah 13 tahun"
        accessibilityHint="Ketuk dua kali untuk memilih mode anak"
        onPress={handleCardPress}
        style={{
          padding: 20,
          backgroundColor: '#FFF9E6',
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#F4D03F',
        }}
      >
        <View importantForAccessibility="no">
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Child Mode</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>Under 13 years old</Text>
        </View>
      </AccessibleCard>

      {/* Alert */}
      <AccessibleAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryButtonText={alertConfig.primaryButtonText}
        secondaryButtonText={alertConfig.secondaryButtonText}
        onPrimaryPress={alertConfig.onPrimaryPress}
        onSecondaryPress={alertConfig.onSecondaryPress}
      />
    </ScrollView>
  );
}
```

## Testing Checklist

- [ ] Semua elemen interaktif memiliki `accessibilityLabel`
- [ ] Tombol penting memiliki `accessibilityHint`
- [ ] `accessibilityRole` diset dengan benar
- [ ] Touch target minimal 56x56px
- [ ] Kontras warna memenuhi WCAG AA (4.5:1 untuk text normal)
- [ ] Text-to-speech berfungsi dengan baik
- [ ] Modal/Alert auto-announce ketika muncul
- [ ] Navigasi dengan screen reader lancar
- [ ] Tidak ada elemen yang ter-skip oleh screen reader

## Referensi

- [React Native Accessibility Docs](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS VoiceOver Testing](https://developer.apple.com/accessibility/ios/)
- [Android TalkBack Testing](https://support.google.com/accessibility/android/answer/6283677)
