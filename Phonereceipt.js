import React, { useState } from "react";
import { View, Text, Button, Image, TextInput, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Tesseract from "tesseract.js";

export default function ReceiptScanner() {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString());

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri) => {
    try {
      const { data: { text } } = await Tesseract.recognize(uri, "eng");
      setExtractedText(text);
      extractDetails(text);
    } catch (error) {
      console.error("OCR Error: ", error);
    }
  };

  const extractDetails = (text) => {
    const lines = text.split("\n");
    const vendorName = lines[0] || "Unknown Vendor";
    const amountMatch = text.match(/\$?([0-9]+\.[0-9]{2})/);
    const extractedAmount = amountMatch ? amountMatch[1] : "Unknown";

    setVendor(vendorName);
    setAmount(extractedAmount);
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Button title="Take Receipt Photo" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: "100%", height: 200, marginTop: 10 }} />}
      {extractedText && (
        <View>
          <Text style={{ marginTop: 10 }}>Extracted Text:</Text>
          <Text>{extractedText}</Text>
          <TextInput placeholder="Vendor Name" value={vendor} onChangeText={setVendor} style={{ borderBottomWidth: 1, marginTop: 10 }} />
          <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={{ borderBottomWidth: 1, marginTop: 10 }} />
          <TextInput placeholder="Purpose (Optional)" value={purpose} onChangeText={setPurpose} style={{ borderBottomWidth: 1, marginTop: 10 }} />
          <Text>Date: {date}</Text>
        </View>
      )}
    </ScrollView>
  );
}
