// import { useState } from 'react';
// import { 
//   View, Image, Text, StyleSheet, ScrollView, 
//   TouchableOpacity, Alert, Platform, TextInput,
//   Modal, ActivityIndicator // Import Modal and ActivityIndicator
// } from 'react-native';
// import { useRouter } from 'expo-router';
// // Use permissions from expo-image-picker instead of expo-camera
// import { useCameraPermissions } from 'expo-image-picker'; // Corrected import source
// import { FontAwesome5 } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system';
// import * as DocumentPicker from 'expo-document-picker';


// export default function HomeScreen() {
//   const router = useRouter();
//   const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
//   const [prompt, setPrompt] = useState('');
//   const [loading, setLoading] = useState(false); // <-- ADDED: Loading state

//   // --- MODIFIED: Added loading state management ---
//   const handleTakePhoto = async () => {
//     if (Platform.OS === 'web') {
//       Alert.alert('Camera Not Available', 'Camera access is not available on web. Please use the file upload option.');
//       return;
//     }

//     // Check permissions
//     if (!cameraPermission?.granted) {
//       const { granted } = await requestCameraPermission();
//       if (!granted) {
//         Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
//         return;
//       }
//     }

//     setLoading(true); // <-- ADDED: Show loading
//     try {
//       let result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false, 
//         quality: 0.5,
//       });

//       setLoading(false); // <-- ADDED: Hide loading after picker closes

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const photoUri = result.assets[0].uri;
//         console.log('Photo taken. URI:', photoUri);
        
//         // Navigate to chat screen with the photo
//         router.push({
//           pathname: '/chat',
//           params: {
//             initialMessage: `I've taken a photo. Can you help me analyze it?`,
//             imageUri: photoUri,
//           },
//         });
//       }
//     } catch (error) {
//       setLoading(false); // <-- ADDED: Hide loading on error
//       console.error('Error taking photo:', error);
//       Alert.alert('Error', 'Failed to take photo. Please try again.');
//     }
//   };
//   // --- END MODIFICATION ---

//   // --- MODIFIED: Added loading state management ---
//   const handleUploadFile = async () => {
//     setLoading(true); // <-- ADDED: Show loading
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: '*/*',
//         copyToCacheDirectory: true,
//       });

//       setLoading(false); // <-- ADDED: Hide loading after picker closes

//       if (!result.canceled && result.assets?.length > 0) {
//         const asset = result.assets[0];
//         let filePreview = `File: ${asset.name}`;
//         let initialMessage = `I have uploaded a document: ${asset.name}. Can you help me analyze it?`;

//         // Check if it's a text-based file and try to read it
//         if (asset.mimeType && (asset.mimeType.startsWith('text/') || asset.name.endsWith('.txt') || asset.name.endsWith('.md'))) {
//           try {
//             const content = await FileSystem.readAsStringAsync(asset.uri, {
//               encoding: FileSystem.EncodingType.UTF8,
//             });
//             const lines = content.split('\n');
//             const firstTwoLines = lines.slice(0, 2).join('\n');

//             console.log(`--- First two lines of ${asset.name} ---`);
//             console.log(firstTwoLines);

//             filePreview += `\n\nFirst 2 lines:\n${firstTwoLines}`;
//             initialMessage = `I uploaded "${asset.name}". Here are the first two lines:\n\n${firstTwoLines}\n\nCan you help me with this?`;

//           } catch (readError) {
//             console.warn('Could not read file preview:', readError);
//           }
//         } else {
//           console.log(`File (${asset.name}) is not plain text, skipping content preview.`);
//         }

//         Alert.alert('File Uploaded', filePreview, [{ text: 'OK' }]);

//         router.push({
//           pathname: '/chat',
//           params: {
//             initialMessage: initialMessage,
//             documentName: asset.name,
//             documentUri: asset.uri
//           },
//         });
//       }
//     } catch (error) {
//       setLoading(false); // <-- ADDED: Hide loading on error
//       console.error('Error picking document:', error);
//       Alert.alert('Error', 'Failed to upload file. Please try again.');
//     }
//   };
//   // --- END MODIFICATION ---

//   const handleAskInChat = (quickMessage = null, quickIcon = 'comment-dots', quickColor = '#4BA3FF') => {
//     // Determine the message to send:
//     // Use the quickMessage if it's a string, otherwise use the 'prompt' from state.
//     const messageToSend = (typeof quickMessage === 'string') 
//       ? quickMessage 
//       : prompt.trim();

//     // Only proceed if we have a non-empty message
//     if (messageToSend) {
//       router.push({
//         pathname: '/chat',
//         params: { 
//           initialMessage: messageToSend,
//           sessionIcon: quickIcon,   // <-- NEW: Pass the icon name
//           sessionColor: quickColor  // <-- NEW: Pass the color
//         },
//       });

//       // Only clear the text input if the message came from the text input
//       if (typeof quickMessage !== 'string') {
//         setPrompt('');
//       }
//     }
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       {/* --- ADDED: Loading Modal Overlay --- */}
//       <Modal
//         transparent={true}
//         animationType="fade"
//         visible={loading}
//         onRequestClose={() => {}}
//       >
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#FFFFFF" />
//           <Text style={styles.loadingText}>Loading...</Text>
//         </View>
//       </Modal>
//       {/* --- END MODIFICATION --- */}

//       <View style={styles.header}>
//         <View style={styles.logoContainer}>
//           <Image
//             source={require('../../assets/images/iconn.png')}
//             style={styles.logo}
//             resizeMode="contain"
//           />
//         </View>
//         <Text style={styles.appName}>WhoToAsk</Text>
//         <Text style={styles.tagline}>Your Legal Guidance Assistant</Text>
//       </View>

//       {/* Two Main Action Boxes */}
//       <View style={styles.actionBoxContainer}>
//         <TouchableOpacity style={[styles.actionBox, styles.cameraBox]} onPress={handleTakePhoto} disabled={loading}>
//           <FontAwesome5 name="camera" size={32} color="#1A3C6E" />
//           <Text style={styles.actionLabel}>Capture Image</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={[styles.actionBox, styles.uploadBox]} onPress={handleUploadFile} disabled={loading}>
//           <FontAwesome5 name="plus" size={32} color="#10B981" />
//           <Text style={[styles.actionLabel, { color: '#10B981' }]}>Upload File</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ChatGPT-style input box */}
//       <View style={styles.chatBox}>
//         <TextInput
//           style={styles.input}
//           placeholder="Ask your legal question..."
//           value={prompt}
//           onChangeText={setPrompt}
//           onSubmitEditing={handleAskInChat}
//           placeholderTextColor="#9CA3AF"
//           underlineColorAndroid="transparent"
//           selectionColor="#1A3C6E"
//         />
//         <TouchableOpacity onPress={handleAskInChat} style={styles.sendButton} disabled={loading}>
//           <FontAwesome5 name="paper-plane" size={18} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>


//       {/* Optional quick help */}
//       <View style={styles.quickHelpSection}>
//         <Text style={styles.sectionTitle}>Quick Help</Text>

//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickHelpScroll}>
//           <QuickCard title="Fines" icon="gavel" color="#2ecc71" 
//             onPress={() => handleAskInChat('I want to know how to pay or contest a fine.', 'gavel', '#2ecc71')} />

//           <QuickCard title="Notices" icon="file-signature" color="#4BA3FF" 
//             onPress={() => handleAskInChat('I received a court notice.', 'file-signature', '#4BA3FF')} />

//           <QuickCard title="Property" icon="home" color="#8B5CF6" 
//             onPress={() => handleAskInChat('I have questions about property law', 'home', '#8B5CF6')} />

//           <QuickCard title="Taxes" icon="file-invoice-dollar" color="#F59E0B" 
//             onPress={() => handleAskInChat('I received a tax notice', 'file-invoice-dollar', '#F59E0B')} />

//           <QuickCard title="IP Law" icon="lightbulb" color="#10B981" 
//             onPress={() => handleAskInChat('Tell me about intellectual property', 'lightbulb', '#10B981')} />
//         </ScrollView>

//       </View>

//       <View style={styles.bottomPadding} />
//     </ScrollView>
//   );
// }

// function QuickCard({ title, icon, color, onPress }) {
//   return (
//     <TouchableOpacity style={[styles.quickCard, { backgroundColor: color + '20' }]} onPress={onPress}>
//       <FontAwesome5 name={icon} size={20} color={color} />
//       <Text style={[styles.quickCardText, { color }]}>{title}</Text>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   // --- ADDED: Styles for loading modal ---
//   loadingOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#FFFFFF',
//     fontSize: 16,
//   },
//   // --- END MODIFICATION ---

//   container: { flex: 1, backgroundColor: '#F7F9FB' },

//   header: {
//     alignItems: 'center',
//     paddingTop: 60,
//     paddingBottom: 20,
//     backgroundColor: '#FFFFFF',
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 20,
//   },
//   logo: {
//     width: 100,
//     height: 100,
//   },
//   appName: { fontSize: 28, fontWeight: '700', color: '#1A3C6E', marginBottom: 6 },
//   tagline: { fontSize: 14, color: '#6B7280', fontWeight: '500' },

//   actionBoxContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     marginTop: 30,
//     paddingHorizontal: 16,
//   },
//   actionBox: {
//     width: '44%',
//     height: 120,
//     borderWidth: 2,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   cameraBox: { borderColor: '#1A3C6E' },
//   uploadBox: { borderColor: '#10B981' },
//   actionLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1A3C6E',
//     marginTop: 8,
//   },

//   chatBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginTop: 30,
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 1,
//   },
//   input: {
//     flex: 1,
//     fontSize: 15,
//     color: '#111827',
//     borderWidth: 1.5,
//     borderColor: '#F59E0B',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: Platform.OS === 'ios' ? 8 : 4,
//     backgroundColor: '#FFFFFF',
//     includeFontPadding: false,
//     textAlignVertical: 'center',
//   },
//   sendButton: {
//     backgroundColor: '#1A3C6E',
//     borderRadius: 18,
//     padding: 10,
//     marginLeft: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },


//   quickHelpSection: {
//     marginTop: 40,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1A3C6E',
//     marginLeft: 16,
//     marginBottom: 12,
//   },
//   quickHelpScroll: { paddingHorizontal: 12 },
//   quickCard: {
//     width: 110,
//     height: 90,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   quickCardText: {
//     fontSize: 13,
//     fontWeight: '600',
//     marginTop: 8,
//   },
//   bottomPadding: { height: 100 },
// });

import { useState } from 'react';
import { 
  View, Image, Text, StyleSheet, ScrollView, 
  TouchableOpacity, Alert, Platform, TextInput,
  Modal, ActivityIndicator // Import Modal and ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
// Use permissions from expo-image-picker instead of expo-camera
import { useCameraPermissions } from 'expo-image-picker'; // Corrected import source
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';


export default function HomeScreen() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false); // <-- ADDED: Loading state
  // const BACKEND_URL = "https://your-ngrok-url.ngrok.io";
  const BACKEND_URL = "http://localhost:8000";

  // --- MODIFIED: Added backend /upload call ---
  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      // ... permission check
      return;
    }

    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
        return;
      }
    }

    setLoading(true); // Show loading
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setLoading(false); // Hide loading if user cancels
        return;
      }
      
      const photoAsset = result.assets[0];
      const photoUri = photoAsset.uri;

      // 1. Construct FormData for upload
      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      // 2. Call the /upload endpoint
      const uploadResponse = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadData = await uploadResponse.json();
      setLoading(false); // Hide loading after upload

      if (uploadData.error) {
        throw new Error(uploadData.error);
      }
      
      // 3. Use the extracted text from the backend
      const extractedText = uploadData.text || '';
      const translation = uploadData.translation ? `\n\nTranslation:\n${uploadData.translation}` : '';
      const initialMessage = `I've taken a photo. Here is the extracted text:\n\n"${extractedText}"${translation}\n\nCan you help me analyze it?`;

      // 4. Navigate to chat screen with the REAL text
      router.push({
        pathname: '/chat',
        params: {
          initialMessage: initialMessage,
          imageUri: photoUri, // Still pass the URI to display in chat (optional)
        },
      });

    } catch (error) {
      setLoading(false); // Hide loading on error
      console.error('Error taking and uploading photo:', error);
      Alert.alert('Error', `Upload failed: ${error.message}`);
    }
  };
  // --- END MODIFICATION ---

  // --- MODIFIED: Added backend /upload call ---
  const handleUploadFile = async () => {
    setLoading(true); // Show loading
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setLoading(false); // Hide loading if user cancels
        return;
      }
      
      const asset = result.assets[0];

      // 1. Construct FormData for upload
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream', // Provide a fallback MIME type
      });

      // 2. Call the /upload endpoint
      const uploadResponse = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadData = await uploadResponse.json();
      setLoading(false); // Hide loading after upload

      if (uploadData.error) {
        throw new Error(uploadData.error);
      }
      
      // 3. Use the extracted text from the backend
      const extractedText = uploadData.text || '';
      const translation = uploadData.translation ? `\n\nTranslation:\n${uploadData.translation}` : '';
      const initialMessage = `I uploaded "${asset.name}". Here is the extracted text:\n\n"${extractedText}"${translation}\n\nCan you help me with this?`;

      // 4. Navigate to chat screen
      Alert.alert('File Uploaded', `File "${asset.name}" was uploaded and processed.`);

      router.push({
        pathname: '/chat',
        params: {
          initialMessage: initialMessage,
          documentName: asset.name,
          documentUri: asset.uri
        },
      });

    } catch (error) {
      setLoading(false); // Hide loading on error
      console.error('Error picking and uploading document:', error);
      Alert.alert('Error', `Upload failed: ${error.message}`);
    }
  };
  // --- END MODIFICATION ---

  const handleAskInChat = (quickMessage = null, quickIcon = 'comment-dots', quickColor = '#4BA3FF') => {
    // Determine the message to send:
    // Use the quickMessage if it's a string, otherwise use the 'prompt' from state.
    const messageToSend = (typeof quickMessage === 'string') 
      ? quickMessage 
      : prompt.trim();

    // Only proceed if we have a non-empty message
    if (messageToSend) {
      router.push({
        pathname: '/chat',
        params: { 
          initialMessage: messageToSend,
          sessionIcon: quickIcon,   // <-- NEW: Pass the icon name
          sessionColor: quickColor  // <-- NEW: Pass the color
        },
      });

      // Only clear the text input if the message came from the text input
      if (typeof quickMessage !== 'string') {
        setPrompt('');
      }
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* --- ADDED: Loading Modal Overlay --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={loading}
        onRequestClose={() => {}}
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Modal>
      {/* --- END MODIFICATION --- */}

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/iconn.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>WhoToAsk</Text>
        <Text style={styles.tagline}>Your Legal Guidance Assistant</Text>
      </View>

      {/* Two Main Action Boxes */}
      <View style={styles.actionBoxContainer}>
        <TouchableOpacity style={[styles.actionBox, styles.cameraBox]} onPress={handleTakePhoto} disabled={loading}>
          <FontAwesome5 name="camera" size={32} color="#1A3C6E" />
          <Text style={styles.actionLabel}>Capture Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBox, styles.uploadBox]} onPress={handleUploadFile} disabled={loading}>
          <FontAwesome5 name="plus" size={32} color="#10B981" />
          <Text style={[styles.actionLabel, { color: '#10B981' }]}>Upload File</Text>
        </TouchableOpacity>
      </View>

      {/* ChatGPT-style input box */}
      <View style={styles.chatBox}>
        <TextInput
          style={styles.input}
          placeholder="Ask your legal question..."
          value={prompt}
          onChangeText={setPrompt}
          onSubmitEditing={handleAskInChat}
          placeholderTextColor="#9CA3AF"
          underlineColorAndroid="transparent"
          selectionColor="#1A3C6E"
        />
        <TouchableOpacity onPress={handleAskInChat} style={styles.sendButton} disabled={loading}>
          <FontAwesome5 name="paper-plane" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>


      {/* Optional quick help */}
      <View style={styles.quickHelpSection}>
        <Text style={styles.sectionTitle}>Quick Help</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickHelpScroll}>
          <QuickCard title="Fines" icon="gavel" color="#2ecc71" 
            onPress={() => handleAskInChat('I want to know how to pay or contest a fine.', 'gavel', '#2ecc71')} />

          <QuickCard title="Notices" icon="file-signature" color="#4BA3FF" 
            onPress={() => handleAskInChat('I received a court notice.', 'file-signature', '#4BA3FF')} />

          <QuickCard title="Property" icon="home" color="#8B5CF6" 
            onPress={() => handleAskInChat('I have questions about property law', 'home', '#8B5CF6')} />

          <QuickCard title="Taxes" icon="file-invoice-dollar" color="#F59E0B" 
            onPress={() => handleAskInChat('I received a tax notice', 'file-invoice-dollar', '#F59E0B')} />

          <QuickCard title="IP Law" icon="lightbulb" color="#10B981" 
            onPress={() => handleAskInChat('Tell me about intellectual property', 'lightbulb', '#10B981')} />
        </ScrollView>

      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function QuickCard({ title, icon, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.quickCard, { backgroundColor: color + '20' }]} onPress={onPress}>
      <FontAwesome5 name={icon} size={20} color={color} />
      <Text style={[styles.quickCardText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // --- ADDED: Styles for loading modal ---
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  // --- END MODIFICATION ---

  container: { flex: 1, backgroundColor: '#F7F9FB' },

  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: { fontSize: 28, fontWeight: '700', color: '#1A3C6E', marginBottom: 6 },
  tagline: { fontSize: 14, color: '#6B7280', fontWeight: '500' },

  actionBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
    paddingHorizontal: 16,
  },
  actionBox: {
    width: '44%',
    height: 120,
    borderWidth: 2,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cameraBox: { borderColor: '#1A3C6E' },
  uploadBox: { borderColor: '#10B981' },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A3C6E',
    marginTop: 8,
  },

  chatBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 30,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    backgroundColor: '#FFFFFF',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: '#1A3C6E',
    borderRadius: 18,
    padding: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },


  quickHelpSection: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A3C6E',
    marginLeft: 16,
    marginBottom: 12,
  },
  quickHelpScroll: { paddingHorizontal: 12 },
  quickCard: {
    width: 110,
    height: 90,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickCardText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  bottomPadding: { height: 100 },
});