import { Fontisto } from '@expo/vector-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window'); // Screen size

const icons = {
  Clouds: 'cloudy',
  Clear: 'day-sunny',
  Rain: 'rains',
  Snow: 'snow',
  Atmosphere: '',
  Drizzle: 'rain',
  Thunderstorm: 'lightning',
};

export default function App() {
  const [city, setCity] = useState('Loading...');
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);

  const askPermission = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setCity(location[0].city);
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&APPID=${process.env.API_KEY}&units=metric`
    );
    const json = await res.json();
    setDays(json.list.filter(({ dt_txt }) => dt_txt.endsWith('03:00:00')));
  };

  useEffect(() => {
    askPermission();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.weather}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator size='large' />
          </View>
        ) : (
          days.map((day, index) => (
            <View style={styles.day}>
              <Text style={styles.date}>
                {dayjs(day.dt_txt).locale('ko').format('YYYY년 M월 D일 (dd)')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={styles.temp}>
                  {parseFloat(day.main.temp).toFixed(1)}
                </Text>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  color='#fff'
                  size={40}
                />
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <StatusBar style='light' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3268a8',
  },
  city: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 40,
    fontWeight: '500',
    color: '#fff',
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: 'start',
    paddingHorizontal: 24,
  },
  date: {
    color: '#fff',
    fontSize: '18',
  },
  temp: {
    marginTop: 10,
    fontSize: 100,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 50,
    color: '#fff',
  },
  tinyText: {
    fontSize: 20,
    color: '#fff',
    marginStart: 4,
  },
});
