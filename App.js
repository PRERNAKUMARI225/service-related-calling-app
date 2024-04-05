import React, { useState, useEffect } from 'react';
import { View, Text, Button, Linking, StyleSheet, TextInput, Alert, TouchableOpacity, Modal, FlatList } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const reasonsData = [
  "High Distance From Home",
  "High Service Cost",
  "High Waiting time",
  "Out of Station",
  "Poor Repair Quality",
  "Service Done at other Dealership",
  "Service Done at Private Workshop",
  "Service Done at Same Dealer",
  "Staff Behaviour",
  "Vehicle Sold",
  "Vehicle theft",
  "Wrong number"
];

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState(new Date());
  const [bookingDate, setBookingDate] = useState(new Date());
  const [isFollowUpDatePickerVisible, setFollowUpDatePickerVisibility] = useState(false);
  const [isBookingDatePickerVisible, setBookingDatePickerVisibility] = useState(false);
  const [isReasonsModalVisible, setReasonsModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [notComingReason, setNotComingReason] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://192.168.29.149:3000/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customer data');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const currentCustomer = customers[currentCustomerIndex];

  const handleCall = () => {
    if (currentCustomer && currentCustomer.Mobno) {
      const { Mobno } = currentCustomer;
      const url = `tel:${Mobno.replace(/\s/g, '')}`;
      Linking.openURL(url);
    } else {
      console.error('No customer data available or phone number missing');
    }
  };

  const saveRemarks = async () => {
    try {
      if (!currentCustomer || !currentCustomer.id) {
        console.error('No customer selected');
        return;
      }

      const response = await fetch('http://192.168.29.149:3000/saveRemarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentCustomer.id,
          remarks: remarks,
          followUpDate: followUpDate.toISOString().split('T')[0],
          bookingDate: bookingDate.toISOString().split('T')[0],
          selectedReason: notComingReason ? notComingReason : selectedReason, // Use notComingReason if available
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save remarks');
      }
      const data = await response.json();
      if (data.success) {
        Alert.alert('Remarks saved successfully!');
        fetchCustomers();
        setRemarks('');
        setBookingDate(new Date());
        setSelectedReason('');
        setNotComingReason('');
        if (notComingReason) {
          Alert.alert('Selected reason:', notComingReason); // Display selected reason on emulator
        }
      } else {
        throw new Error('Failed to save remarks');
      }
    } catch (error) {
      console.error('Error saving remarks:', error);
      Alert.alert('Failed to save remarks');
    }
  };

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    setReasonsModalVisible(false);
  };

  const handleNotComingSelect = (reason) => {
    setNotComingReason(reason);
    setRemarks('Not Coming');
    setReasonsModalVisible(false);
  };

  const handleFollowUpDateChange = (date) => {
    setFollowUpDate(date);
    setFollowUpDatePickerVisibility(false);
  };

  const handleFollowUpDatePickerVisibilityChange = (visible) => {
    if (!visible) {
      setFollowUpDatePickerVisibility(visible);
    } else {
      setFollowUpDatePickerVisibility(visible);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.heading}>CUSTOMER DETAILS</Text>
        <Text style={styles.text}>Customer ID: {currentCustomer ? currentCustomer.id : 'Loading...'}</Text>
        <Text style={styles.text}>Customer Name: {currentCustomer ? currentCustomer.Name : 'Loading...'}</Text>
        <Text style={styles.text}>Customer Phone: {currentCustomer ? currentCustomer.Mobno : 'Loading...'}</Text>
        <Text style={styles.text}>JCNo: {currentCustomer ? currentCustomer.JCNo : 'Loading...'}</Text>
        <Text style={styles.text}>Model: {currentCustomer ? currentCustomer.Model : 'Loading...'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter remarks"
          value={remarks}
          onChangeText={setRemarks}
        />
        <View>
          <Button title="Select Follow-up Date" onPress={() => setFollowUpDatePickerVisibility(true)} />
          <DateTimePickerModal
            isVisible={isFollowUpDatePickerVisible}
            mode="date"
            date={followUpDate}
            onConfirm={handleFollowUpDateChange}
            onCancel={() => setFollowUpDatePickerVisibility(false)}
            minimumDate={new Date()} // Set minimum date to current date
          />
          <Text>{followUpDate.toDateString()}</Text>
        </View>
        <View>
          <Button title="Select Booking Date" onPress={() => setBookingDatePickerVisibility(true)} />
          <DateTimePickerModal
            isVisible={isBookingDatePickerVisible}
            mode="date"
            onConfirm={(date) => { setBookingDate(date); setBookingDatePickerVisibility(false); }}
            onCancel={() => setBookingDatePickerVisibility(false)}
            maximumDate={new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 9))} // Set maximum date to 9 days from current date
          />
          <Text>{bookingDate.toDateString()}</Text>
        </View>
        <View style={{ marginTop: 20 }}>
          <Button title="Not Coming Reason" onPress={() => setReasonsModalVisible(true)} />
          <Modal
            animationType="slide"
            transparent={true}
            visible={isReasonsModalVisible}
            onRequestClose={() => setReasonsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <FlatList
                  data={reasonsData}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleNotComingSelect(item)}>
                      <Text style={styles.reasonText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            </View>
          </Modal>
        </View>
      </View>
      <View style={styles.buttonsContainer}>
        <Button title="Call Customer" onPress={handleCall} />
        <Button title="Save Remarks" onPress={saveRemarks} disabled={!remarks} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 20,
  },
  text: {
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: 'black',
    borderWidth: 2,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '180%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    maxHeight: 300,
  },
  reasonText: {
    fontSize: 16,
    paddingVertical: 10,
  },
});

export default App;
