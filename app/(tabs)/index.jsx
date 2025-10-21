// import React, { useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useCameraPermissions } from 'expo-camera';
// import * as DocumentPicker from 'expo-document-picker';
// import ActionButton from '../../components/ActionButton';
// import QuickHelpCard from '../../components/QuickHelpCard';

// export default function HomeScreen() {
//   const router = useRouter();
//   const [cameraPermission, requestCameraPermission] = useCameraPermissions();

//   const handleTakePhoto = async () => {
//     if (Platform.OS === 'web') {
//       Alert.alert('Camera Not Available', 'Camera access is not available on web. Please use the file upload option.');
//       return;
//     }

//     if (!cameraPermission?.granted) {
//       const { granted } = await requestCameraPermission();
//       if (!granted) {
//         Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
//         return;
//       }
//     }

//     router.push('/camera');
//   };

//   const handleUploadFile = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: '*/*',
//         copyToCacheDirectory: true,
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         Alert.alert('File Uploaded', `File: ${result.assets[0].name}`);
//         router.push({
//           pathname: '/chat',
//           params: {
//             initialMessage: `I have uploaded a document: ${result.assets[0].name}. Can you help me analyze it?`,
//             documentName: result.assets[0].name
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Error picking document:', error);
//       Alert.alert('Error', 'Failed to upload file. Please try again.');
//     }
//   };

//   const handleAskInChat = () => {
//     router.push('/chat');
//   };

//   const handleQuickHelp = (prompt) => {
//     router.push({
//       pathname: '/chat',
//       params: { initialMessage: prompt }
//     });
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <View style={styles.header}>
//         <View style={styles.logoContainer}>
//           <Text style={styles.logo}>⚖️</Text>
//         </View>
//         <Text style={styles.appName}>WhoToAsk</Text>
//         <Text style={styles.tagline}>Your Legal Guidance Assistant</Text>
//       </View>

//       <View style={styles.actionsContainer}>
//         <ActionButton
//           title="Take a photo"
//           subtitle="Scan documents with your camera"
//           icon="📸"
//           onPress={handleTakePhoto}
//           variant="primary"
//         />

//         <ActionButton
//           title="Upload a file"
//           subtitle="Choose documents from your device"
//           icon="📄"
//           onPress={handleUploadFile}
//           variant="secondary"
//         />

//         <ActionButton
//           title="Ask in chat"
//           subtitle="Start a conversation directly"
//           icon="💬"
//           onPress={handleAskInChat}
//           variant="accent"
//         />
//       </View>

//       <View style={styles.quickHelpSection}>
//         <Text style={styles.sectionTitle}>Quick Help</Text>

//         <View style={styles.quickHelpGrid}>
//           <QuickHelpCard
//             title="Draft a contract"
//             icon="📝"
//             backgroundColor="#4BA3FF"
//             onPress={() => handleQuickHelp('I need help drafting a contract')}
//           />

//           <QuickHelpCard
//             title="Intellectual property"
//             icon="💡"
//             backgroundColor="#10B981"
//             onPress={() => handleQuickHelp('I have questions about intellectual property')}
//           />
//         </View>

//         <View style={styles.quickHelpGrid}>
//           <QuickHelpCard
//             title="Tax notice help"
//             icon="📋"
//             backgroundColor="#F59E0B"
//             onPress={() => handleQuickHelp('I received a tax notice and need guidance')}
//           />

//           <QuickHelpCard
//             title="Property issues"
//             icon="🏠"
//             backgroundColor="#8B5CF6"
//             onPress={() => handleQuickHelp('I need help with property legal issues')}
//           />
//         </View>
//       </View>

//       <View style={styles.bottomPadding} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F7F9FB',
//   },
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
//     width: 80,
//     height: 80,
//     borderRadius: 20,
//     backgroundColor: '#1A3C6E',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//     shadowColor: '#1A3C6E',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   logo: {
//     fontSize: 40,
//   },
//   appName: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1A3C6E',
//     marginBottom: 6,
//   },
//   tagline: {
//     fontSize: 14,
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   actionsContainer: {
//     paddingTop: 24,
//   },
//   quickHelpSection: {
//     paddingTop: 32,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#1A3C6E',
//     marginLeft: 16,
//     marginBottom: 16,
//   },
//   quickHelpGrid: {
//     flexDirection: 'row',
//     paddingHorizontal: 8,
//   },
//   bottomPadding: {
//     height: 100,
//   },
// });


import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import { FontAwesome5 } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [prompt, setPrompt] = useState('');

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Camera Not Available', 'Camera access is not available on web. Please use the file upload option.');
      return;
    }

    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
        return;
      }
    }

    router.push('/camera');
  };

  const handleUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        Alert.alert('File Uploaded', `File: ${result.assets[0].name}`);
        router.push({
          pathname: '/chat',
          params: {
            initialMessage: `I have uploaded a document: ${result.assets[0].name}. Can you help me analyze it?`,
            documentName: result.assets[0].name,
          },
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
    }
  };

  const handleAskInChat = () => {
    if (prompt.trim()) {
      router.push({
        pathname: '/chat',
        params: { initialMessage: prompt },
      });
      setPrompt('');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>⚖️</Text>
        </View>
        <Text style={styles.appName}>WhoToAsk</Text>
        <Text style={styles.tagline}>Your Legal Guidance Assistant</Text>
      </View>

      {/* Two Main Action Boxes */}
      <View style={styles.actionBoxContainer}>
        <TouchableOpacity style={[styles.actionBox, styles.cameraBox]} onPress={handleTakePhoto}>
          <FontAwesome5 name="camera" size={32} color="#1A3C6E" />
          <Text style={styles.actionLabel}>Scan Document</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBox, styles.uploadBox]} onPress={handleUploadFile}>
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
          underlineColorAndroid="transparent"  // ✅ removes Android underline
          selectionColor="#1A3C6E"              // optional, customize cursor color
        />
        <TouchableOpacity onPress={handleAskInChat} style={styles.sendButton}>
          <FontAwesome5 name="paper-plane" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>


      {/* Optional quick help */}
      <View style={styles.quickHelpSection}>
        <Text style={styles.sectionTitle}>Quick Help</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickHelpScroll}>
          <QuickCard title="Contracts" icon="file-signature" color="#4BA3FF" onPress={() => handleAskInChat('I need help drafting a contract')} />
          <QuickCard title="Property" icon="home" color="#8B5CF6" onPress={() => handleAskInChat('I have questions about property law')} />
          <QuickCard title="Taxes" icon="file-invoice-dollar" color="#F59E0B" onPress={() => handleAskInChat('I received a tax notice')} />
          <QuickCard title="IP Law" icon="lightbulb" color="#10B981" onPress={() => handleAskInChat('Tell me about intellectual property')} />
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
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1A3C6E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: { fontSize: 40 },
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
    borderColor: '#F59E0B',   // golden/orange outline like in your screenshot
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
