'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Thermometer, Droplets, Wind, Eye, Sunrise, Sunset, Cloud, Sun, Moon } from 'lucide-react';

interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    wind_mph: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
    vis_km: number;
    pressure_mb: number;
    last_updated: string;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        temp_f: number;
        condition: {
          text: string;
          icon: string;
        };
        humidity: number;
        wind_kph: number;
        description: string;
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
    }>;
  };
}

interface FestivalData {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  imageUrl?: string;
}

export default function WeatherApp() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [festivalData, setFestivalData] = useState<FestivalData[]>([]);
  const [showAllFestivals, setShowAllFestivals] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const API_KEY = process.env.OPENWEATHER_API_KEY || '';
  const API_URL = 'https://api.openweathermap.org/data/2.5';
  const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY || '';
  const popularCities = [
    'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Seongnam', 'Bucheon',
    'Goyang', 'Yongin', 'Ansan', 'Anyang', 'Pohang', 'Jeonju', 'Changwon', 'Jeju', 'Gimhae', 'Gumi',
    'Gunpo', 'Guri', 'Gwacheon', 'Gwangmyeong', 'Gyeongju', 'Gyeongsan', 'Hanam', 'Hwaseong', 'Icheon', 'Iksan',
    'Jeongeup', 'Jinju', 'Miryang', 'Mokpo', 'Namwon', 'Namyangju', 'Nonsan', 'Osan', 'Paju', 'Pocheon',
    'Pyeongtaek', 'Sacheon', 'Samcheok', 'Sangju', 'Sejong', 'Siheung', 'Suncheon', 'Tongyeong', 'Wonju', 'Yangju',
    'Yangsan', 'Yeoju', 'Yeongcheon', 'Yeongju', 'Yeosu'
  ];

  // 한국어 도시명 매핑 확장
  const koreanCityNames: { [key: string]: string } = {
    'Seoul': '서울',
    'Busan': '부산', 
    'Incheon': '인천',
    'Daegu': '대구',
    'Daejeon': '대전',
    'Gwangju': '광주',
    'Suwon': '수원',
    'Ulsan': '울산',
    'Seongnam': '성남',
    'Bucheon': '부천',
    'Goyang': '고양',
    'Yongin': '용인',
    'Ansan': '안산',
    'Anyang': '안양',
    'Pohang': '포항',
    'Jeonju': '전주',
    'Changwon': '창원',
    'Jeju': '제주',
    // 추가 도시들
    'Gimhae': '김해',
    'Gumi': '구미',
    'Gunpo': '군포',
    'Guri': '구리',
    'Gwacheon': '과천',
    'Gwangmyeong': '광명',
    'Gyeongju': '경주',
    'Gyeongsan': '경산',
    'Hanam': '하남',
    'Hwaseong': '화성',
    'Icheon': '이천',
    'Iksan': '익산',
    'Jeongeup': '정읍',
    'Jinju': '진주',
    'Miryang': '밀양',
    'Mokpo': '목포',
    'Namwon': '남원',
    'Namyangju': '남양주',
    'Nonsan': '논산',
    'Osan': '오산',
    'Paju': '파주',
    'Pocheon': '포천',
    'Pyeongtaek': '평택',
    'Sacheon': '사천',
    'Samcheok': '삼척',
    'Sangju': '상주',
    'Sejong': '세종',
    'Siheung': '시흥',
    'Suncheon': '순천',
    'Tongyeong': '통영',
    'Wonju': '원주',
    'Yangju': '양주',
    'Yangsan': '양산',
    'Yeoju': '여주',
    'Yeongcheon': '영천',
    'Yeongju': '영주',
    'Yeosu': '여수'
  };

  // 한국 도시들의 좌표 정보 (OpenWeatherMap API에서 찾을 수 없는 도시들)
  const cityCoordinates: { [key: string]: { lat: number; lon: number; name: string } } = {
    'Guri': { lat: 37.5944, lon: 127.1296, name: 'Guri' },
    'Gunpo': { lat: 37.3617, lon: 126.9353, name: 'Gunpo' },
    'Gwacheon': { lat: 37.4295, lon: 126.9873, name: 'Gwacheon' },
    'Gwangmyeong': { lat: 37.4772, lon: 126.8669, name: 'Gwangmyeong' },
    'Gyeongsan': { lat: 35.8233, lon: 128.7378, name: 'Gyeongsan' },
    'Hanam': { lat: 37.5392, lon: 127.2149, name: 'Hanam' },
    'Hwaseong': { lat: 37.1995, lon: 126.8319, name: 'Hwaseong' },
    'Icheon': { lat: 37.2799, lon: 127.4425, name: 'Icheon' },
    'Iksan': { lat: 35.9483, lon: 126.9575, name: 'Iksan' },
    'Jeongeup': { lat: 35.6000, lon: 126.9167, name: 'Jeongeup' },
    'Jinju': { lat: 35.1925, lon: 128.0847, name: 'Jinju' },
    'Miryang': { lat: 35.4933, lon: 128.7489, name: 'Miryang' },
    'Mokpo': { lat: 34.7936, lon: 126.3886, name: 'Mokpo' },
    'Namwon': { lat: 35.4167, lon: 127.3333, name: 'Namwon' },
    'Namyangju': { lat: 37.6366, lon: 127.2167, name: 'Namyangju' },
    'Nonsan': { lat: 36.2039, lon: 127.0847, name: 'Nonsan' },
    'Osan': { lat: 37.1452, lon: 127.0697, name: 'Osan' },
    'Paju': { lat: 37.8156, lon: 126.7947, name: 'Paju' },
    'Pocheon': { lat: 37.8945, lon: 127.2002, name: 'Pocheon' },
    'Pyeongtaek': { lat: 36.9920, lon: 127.1128, name: 'Pyeongtaek' },
    'Sacheon': { lat: 35.0033, lon: 128.0578, name: 'Sacheon' },
    'Samcheok': { lat: 37.4500, lon: 129.1667, name: 'Samcheok' },
    'Sangju': { lat: 36.4153, lon: 128.1606, name: 'Sangju' },
    'Sejong': { lat: 36.4870, lon: 127.2827, name: 'Sejong' },
    'Siheung': { lat: 37.3795, lon: 126.8030, name: 'Siheung' },
    'Suncheon': { lat: 34.9506, lon: 127.4872, name: 'Suncheon' },
    'Tongyeong': { lat: 34.8458, lon: 128.4339, name: 'Tongyeong' },
    'Wonju': { lat: 37.3511, lon: 127.9453, name: 'Wonju' },
    'Yangju': { lat: 37.8333, lon: 127.0611, name: 'Yangju' },
    'Yangsan': { lat: 35.3386, lon: 129.0386, name: 'Yangsan' },
    'Yeoju': { lat: 37.2983, lon: 127.6375, name: 'Yeoju' },
    'Yeongcheon': { lat: 35.9733, lon: 128.9511, name: 'Yeongcheon' },
    'Yeongju': { lat: 36.8217, lon: 128.6308, name: 'Yeongju' },
    'Yeosu': { lat: 34.7604, lon: 127.6622, name: 'Yeosu' }
  };

  // 영어 도시명을 한국어로 변환
  const getKoreanCityName = (englishCityName: string): string => {
    return koreanCityNames[englishCityName] || englishCityName;
  };

  // 한국어 도시명을 영어로 변환 (API 호출용)
  const getEnglishCityName = (koreanCityName: string): string => {
    for (const [english, korean] of Object.entries(koreanCityNames)) {
      if (korean === koreanCityName) {
        return english;
      }
    }
    return koreanCityName;
  };

  // 클라이언트 사이드 렌더링 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 현재 시간을 1초마다 업데이트 (클라이언트에서만)
  useEffect(() => {
    if (!isClient) return;
    
    // 초기 시간 설정
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isClient]);

  // 컴포넌트 마운트 시 현재 위치 기반으로 날씨 정보 가져오기 (클라이언트에서만)
  useEffect(() => {
    if (!isClient) return;
    
    const initWeather = async () => {
      await getCurrentLocationWeather();
    };
    initWeather();
  }, [isClient]);

  // IP 기반으로 현재 위치 파악하고 날씨 정보 가져오기
  const getCurrentLocationWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // IP 기반으로 현재 위치 파악 (한국으로 제한) - 여러 API 시도
      let locationData = null;
      
      try {
        // 첫 번째 API 시도
        const ipResponse = await axios.get('https://ipapi.co/json/', {
          timeout: 8000
        });
        locationData = ipResponse.data;
        console.log('ipapi.co에서 위치 정보 가져옴:', locationData);
      } catch (error) {
        console.log('ipapi.co 실패, 대체 API 시도...');
        try {
          // 두 번째 API 시도
          const ipResponse2 = await axios.get('https://ipinfo.io/json', {
            timeout: 8000
          });
          locationData = {
            city: ipResponse2.data.city,
            country: ipResponse2.data.country,
            latitude: parseFloat(ipResponse2.data.loc.split(',')[0]),
            longitude: parseFloat(ipResponse2.data.loc.split(',')[1])
          };
          console.log('ipinfo.io에서 위치 정보 가져옴:', locationData);
        } catch (error2) {
          console.log('모든 IP API 실패, 서울을 기본값으로 설정');
          await fetchWeather('Seoul');
          return;
        }
      }
      
      const { city, country, latitude, longitude } = locationData;
      
      // 한국이 아닌 경우 서울을 기본값으로 설정
      if (country !== 'KR') {
        console.log('한국이 아닌 위치에서 접속, 서울을 기본값으로 설정');
        await fetchWeather('Seoul');
        return;
      }
      
      // 한국인 경우 현재 위치로 날씨 정보 가져오기
      console.log(`현재 위치: ${city}, ${country} (${latitude}, ${longitude})`);
      
      // 도시명이 영어인 경우 한국어로 변환
      const koreanCityName = getKoreanCityName(city);
      if (koreanCityName) {
        setCity(koreanCityName);
        // 영어 도시명으로 API 호출 (한국어로는 API가 인식하지 못할 수 있음)
        const englishCityName = getEnglishCityName(koreanCityName);
        await fetchWeather(englishCityName);
      } else {
        // 매핑되지 않은 도시는 좌표 기반으로 날씨 정보 가져오기
        await fetchWeatherByCoordinates(latitude, longitude, city);
      }
      
    } catch (error: any) {
      console.error('현재 위치 파악 실패:', error);
      // 실패 시 서울을 기본값으로 설정
      console.log('IP 기반 위치 감지 실패, 서울을 기본값으로 설정');
      await fetchWeather('Seoul');
    } finally {
      setLoading(false);
    }
  };

  // 좌표 기반으로 날씨 정보 가져오기
  const fetchWeatherByCoordinates = async (lat: number, lon: number, cityName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. 현재 날씨 정보 가져오기
      const currentResponse = await axios.get(`${API_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
          lang: 'kr'
        }
      });
      
      // 2. 5일 예보 가져오기
      const forecastResponse = await axios.get(`${API_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
          lang: 'kr'
        }
      });
      
      // OpenWeatherMap 데이터를 앱 형식으로 변환
      const weatherData: WeatherData = {
        location: {
          // API 응답의 영어 도시명을 한국어로 변환
          name: getKoreanCityName(currentResponse.data.name) || currentResponse.data.name,
          country: currentResponse.data.sys.country,
          lat,
          lon,
          localtime: isClient && currentTime ? currentTime.toISOString() : new Date().toISOString()
        },
        current: {
          temp_c: currentResponse.data.main.temp,
          temp_f: (currentResponse.data.main.temp * 9/5) + 32,
          condition: {
            text: currentResponse.data.weather[0].description,
            icon: currentResponse.data.weather[0].icon
          },
          humidity: currentResponse.data.main.humidity,
          wind_kph: currentResponse.data.wind.speed * 3.6,
          wind_mph: currentResponse.data.wind.speed * 2.237,
          feelslike_c: currentResponse.data.main.feels_like,
          feelslike_f: (currentResponse.data.main.feels_like * 9/5) + 32,
          uv: 0,
          vis_km: currentResponse.data.visibility / 1000,
          pressure_mb: currentResponse.data.main.pressure,
          last_updated: isClient && currentTime ? currentTime.toISOString() : new Date().toISOString()
        },
        forecast: {
          forecastday: forecastResponse.data.list
            .filter((item: any, index: number) => index % 8 === 0)
            .slice(0, 7)
            .map((item: any, index: number) => {
              // 오늘 날짜인 경우 현재 날씨 API에서 일출/일몰 시간 가져오기
              let sunriseTime, sunsetTime;
              if (index === 0) {
                // 오늘의 일출/일몰 시간 (현재 날씨 API에서 가져옴)
                sunriseTime = new Date(currentResponse.data.sys.sunrise * 1000).toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: false 
                });
                sunsetTime = new Date(currentResponse.data.sys.sunset * 1000).toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: false 
                });
              } else {
                // 내일부터는 계산된 일출/일몰 시간 (대략적인 추정)
                const targetDate = new Date(item.dt * 1000);
                const baseDate = new Date(currentResponse.data.sys.sunrise * 1000);
                const dayDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
                
                // 일출/일몰 시간을 하루씩 미뤄서 계산 (대략적)
                const estimatedSunrise = new Date(baseDate.getTime() + (dayDiff * 24 * 60 * 60 * 1000));
                const estimatedSunset = new Date(baseDate.getTime() + (dayDiff * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000));
                
                sunriseTime = estimatedSunrise.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: false 
                });
                sunsetTime = estimatedSunset.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: false 
                });
              }
              
              return {
                date: new Date(item.dt * 1000).toISOString().split('T')[0],
                day: {
                  maxtemp_c: item.main.temp_max,
                  mintemp_c: item.main.temp_min,
                  temp_f: (item.main.temp * 9/5) + 32,
                  condition: {
                    text: item.weather[0].description,
                    icon: item.weather[0].icon
                  },
                  humidity: item.main.humidity,
                  wind_kph: item.wind.speed * 3.6,
                  description: item.weather[0].description
                },
                astro: {
                  sunrise: sunriseTime,
                  sunset: sunsetTime
                }
              };
            })
        }
      };
      
      setWeatherData(weatherData);
      
      // 행사/축제 정보도 함께 가져오기
      const festivals = await fetchFestivals(cityName);
      setFestivalData(festivals);
      
      // 검색 히스토리에 추가
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item.toLowerCase() !== cityName.toLowerCase());
        return [cityName, ...filtered].slice(0, 5);
      });
      
    } catch (err: any) {
      console.error('좌표 기반 날씨 정보 가져오기 실패:', err);
      setError('현재 위치의 날씨 정보를 가져오는데 실패했습니다.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

    const fetchWeather = async (cityName: string) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 한국어 도시명을 영어로 변환 (API 호출용)
      let englishCityName = cityName;
      if (Object.values(koreanCityNames).includes(cityName)) {
        englishCityName = getEnglishCityName(cityName);
        console.log(`한국어 도시명 "${cityName}"을 영어 "${englishCityName}"로 변환`);
      }
      
      let lat: number, lon: number, name: string, country: string;
      
      // 좌표 정보가 있는 도시인지 확인
      if (cityCoordinates[englishCityName]) {
        console.log(`좌표 정보가 있는 도시: ${englishCityName}`);
        const coords = cityCoordinates[englishCityName];
        lat = coords.lat;
        lon = coords.lon;
        name = coords.name;
        country = 'KR';
      } else {
        // 1. 도시명으로 좌표 검색 (한국으로 제한)
        try {
          const geoResponse = await axios.get(`${API_URL}/weather`, {
            params: {
              q: `${englishCityName},KR`,
              appid: API_KEY,
              units: 'metric',
              lang: 'kr'
            }
          });
          
          const coordData = geoResponse.data.coord;
          lat = coordData.lat;
          lon = coordData.lon;
          name = geoResponse.data.name;
          country = geoResponse.data.sys.country;
        } catch (geoError: any) {
          console.error('도시명으로 좌표 검색 실패:', geoError);
          // 좌표 검색 실패 시 서울을 기본값으로 설정
          console.log(`도시 "${englishCityName}"을 찾을 수 없어 서울로 대체`);
          lat = 37.5665;
          lon = 126.9780;
          name = 'Seoul';
          country = 'KR';
        }
      }
      
      // 2. 현재 날씨 정보 가져오기
      const currentResponse = await axios.get(`${API_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
          lang: 'kr'
        }
      });
      
      // 3. 5일 예보 가져오기
      const forecastResponse = await axios.get(`${API_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
          lang: 'kr'
        }
      });
      
      // OpenWeatherMap 데이터를 앱 형식으로 변환
      const weatherData: WeatherData = {
        location: {
          // API 응답의 영어 도시명을 한국어로 변환
          name: getKoreanCityName(currentResponse.data.name) || currentResponse.data.name,
          country: currentResponse.data.sys.country,
          lat,
          lon,
          localtime: isClient && currentTime ? currentTime.toISOString() : new Date().toISOString()
        },
        current: {
          temp_c: currentResponse.data.main.temp,
          temp_f: (currentResponse.data.main.temp * 9/5) + 32,
          condition: {
            text: currentResponse.data.weather[0].description,
            icon: currentResponse.data.weather[0].icon
          },
          humidity: currentResponse.data.main.humidity,
          wind_kph: currentResponse.data.wind.speed * 3.6, // m/s to km/h
          wind_mph: currentResponse.data.wind.speed * 2.237, // m/s to mph
          feelslike_c: currentResponse.data.main.feels_like,
          feelslike_f: (currentResponse.data.main.feels_like * 9/5) + 32,
          uv: 0, // OpenWeatherMap free tier doesn't provide UV
          vis_km: currentResponse.data.visibility / 1000,
          pressure_mb: currentResponse.data.main.pressure,
                     last_updated: isClient && currentTime ? currentTime.toISOString() : new Date().toISOString()
        },
        forecast: {
          forecastday: forecastResponse.data.list
            .filter((item: any, index: number) => index % 8 === 0) // 24시간 간격으로 필터링
            .slice(0, 7) // 7일만
            .map((item: any, index: number) => {
              // 오늘 날짜인 경우 현재 날씨 API에서 일출/일몰 시간 가져오기
              let sunriseTime, sunsetTime;
              if (index === 0) {
                // 오늘의 일출/일몰 시간 (현재 날씨 API에서 가져옴)
                sunriseTime = new Date(currentResponse.data.sys.sunrise * 1000).toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: false 
                });
                sunsetTime = new Date(currentResponse.data.sys.sunset * 1000).toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: false 
                });
              } else {
                // 내일부터는 계산된 일출/일몰 시간 (대략적인 추정)
                const targetDate = new Date(item.dt * 1000);
                const baseDate = new Date(currentResponse.data.sys.sunrise * 1000);
                const dayDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
                
                // 일출/일몰 시간을 하루씩 미뤄서 계산 (대략적)
                const estimatedSunrise = new Date(baseDate.getTime() + (dayDiff * 24 * 60 * 60 * 1000));
                const estimatedSunset = new Date(baseDate.getTime() + (dayDiff * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000));
                
                sunriseTime = estimatedSunrise.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: false 
                });
                sunsetTime = estimatedSunset.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: false 
                });
              }
              
              return {
                date: new Date(item.dt * 1000).toISOString().split('T')[0],
                day: {
                  maxtemp_c: item.main.temp_max,
                  mintemp_c: item.main.temp_min,
                  temp_f: (item.main.temp * 9/5) + 32,
                  condition: {
                    text: item.weather[0].description,
                    icon: item.weather[0].icon
                  },
                  humidity: item.main.humidity,
                  wind_kph: item.wind.speed * 3.6,
                  description: item.weather[0].description
                },
                astro: {
                  sunrise: sunriseTime,
                  sunset: sunsetTime
                }
              };
            })
        }
      };
      
             setWeatherData(weatherData);
       
       // 행사/축제 정보도 함께 가져오기
       const festivals = await fetchFestivals(cityName);
       setFestivalData(festivals);
       
       // 검색 히스토리에 추가 (중복 제거)
       setSearchHistory(prev => {
         const filtered = prev.filter(item => item.toLowerCase() !== cityName.toLowerCase());
         return [cityName, ...filtered].slice(0, 5); // 최대 5개 유지
       });
      
         } catch (err: any) {
       console.error('날씨 정보 가져오기 실패:', err);
       
       if (err.response?.status === 400) {
         setError('도시를 찾을 수 없습니다. 정확한 한국 도시명을 입력해주세요.');
       } else if (err.response?.status === 401) {
         setError('API 키가 유효하지 않습니다. 관리자에게 문의하세요.');
       } else if (err.response?.status === 429) {
         setError('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
       } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
         setError('네트워크 연결이 느립니다. 잠시 후 다시 시도해주세요.');
       } else if (err.message?.includes('Network Error')) {
         setError('네트워크 연결을 확인해주세요. 인터넷 연결 상태를 점검해보세요.');
       } else {
         setError('날씨 정보를 가져오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
       }
       setWeatherData(null);
     } finally {
       setLoading(false);
     }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && city.trim()) {
      fetchWeather(city.trim());
    }
  };

  const formatTime = (time: string) => {
    // 클라이언트가 아닌 경우 기본값 반환
    if (!isClient) return '00:00';
    
    // time이 이미 시간 형식의 문자열인 경우 (예: "06:30")
    if (typeof time === 'string' && time.includes(':')) {
      return time;
    }
    
    // time이 숫자인 경우 (Unix timestamp)
    if (typeof time === 'number') {
      return new Date(time * 1000).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    // 기본값 반환
    return '00:00';
  };

  // 날씨 상태를 한국어로 변환
  const getKoreanWeatherText = (condition: string): string => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) return '맑음';
    if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) return '흐림';
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) return '비';
    if (conditionLower.includes('snow') || conditionLower.includes('sleet')) return '눈';
    if (conditionLower.includes('thunder') || conditionLower.includes('storm')) return '천둥번개';
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '안개';
    if (conditionLower.includes('haze') || conditionLower.includes('dust')) return '연무';
    return condition;
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) return <Cloud className="w-8 h-8 text-gray-400" />;
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) return <Droplets className="w-8 h-8 text-blue-500" />;
    if (conditionLower.includes('snow') || conditionLower.includes('sleet')) return <Cloud className="w-8 h-8 text-blue-200" />;
    if (conditionLower.includes('thunder') || conditionLower.includes('storm')) return <Cloud className="w-8 h-8 text-purple-500" />;
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return <Cloud className="w-8 h-8 text-gray-300" />;
    if (conditionLower.includes('haze') || conditionLower.includes('dust')) return <Cloud className="w-8 h-8 text-orange-300" />;
    return <Cloud className="w-8 h-8 text-gray-400" />;
  };

  const getWeatherBackground = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return 'from-yellow-50 via-orange-50 to-red-50';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
      return 'from-blue-50 via-indigo-50 to-purple-50';
    } else if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
      return 'from-blue-50 via-cyan-50 to-blue-100';
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return 'from-purple-50 via-indigo-50 to-blue-50';
    } else if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
      return 'from-gray-50 via-slate-50 to-gray-100';
    }
    return 'from-blue-50 via-indigo-50 to-purple-50';
  };

    // 공공데이터 포털에서 행사/축제 정보 가져오기
  const fetchFestivals = async (cityName: string) => {
    try {
      // 한국어 도시명을 영어로 변환 (지역코드 매핑용)
      let englishCityName = cityName;
      if (Object.values(koreanCityNames).includes(cityName)) {
        englishCityName = getEnglishCityName(cityName);
        console.log(`행사 정보 요청: 한국어 "${cityName}" -> 영어 "${englishCityName}"`);
      }
      
      console.log('행사 정보 요청 시작:', englishCityName);
      console.log('지역코드:', getAreaCode(englishCityName));
      
      // 좌표 정보가 있는 도시인지 확인하고 로깅
      if (cityCoordinates[englishCityName]) {
        console.log(`좌표 정보가 있는 도시: ${englishCityName} (${cityCoordinates[englishCityName].lat}, ${cityCoordinates[englishCityName].lon})`);
      }
      
      const params = {
        serviceKey: PUBLIC_DATA_API_KEY,
        numOfRows: 10,
        pageNo: 1,
        MobileOS: 'ETC',
        MobileApp: 'WeatherApp',
        _type: 'json',
        arrange: 'C', // 최신순 정렬
        areaCode: getAreaCode(englishCityName), // 도시별 지역코드
        eventStartDate: new Date().toISOString().split('T')[0].replace(/-/g, ''), // 오늘부터
        eventEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '') // 30일 후까지
      };
      
      console.log('API 요청 파라미터:', params);
      
             const response = await axios.get('https://apis.data.go.kr/B551011/KorService2/searchFestival2', {
         params
       });

             console.log('API 응답:', response.data);
       console.log('응답 상태:', response.data.response?.header?.resultCode);
       console.log('응답 메시지:', response.data.response?.header?.resultMsg);
       console.log('전체 응답 구조:', JSON.stringify(response.data, null, 2));

      if (response.data.response?.body?.items?.item) {
        const festivals = Array.isArray(response.data.response.body.items.item) 
          ? response.data.response.body.items.item 
          : [response.data.response.body.items.item];
        
        console.log('파싱된 행사 데이터:', festivals);
        
        const mappedFestivals = festivals.map((festival: any) => ({
          title: festival.title || '제목 없음',
          startDate: festival.eventstartdate || '',
          endDate: festival.eventenddate || '',
          location: festival.addr1 || '위치 정보 없음',
          description: festival.overview || '설명 없음',
          imageUrl: festival.firstimage || festival.firstimage2
        }));
        
        console.log('매핑된 행사 데이터:', mappedFestivals);
        return mappedFestivals;
      } else {
        console.log('행사 데이터가 없습니다. 응답 구조:', response.data.response?.body);
        return [];
      }
    } catch (error: any) {
      console.error('행사 정보 가져오기 실패:', error);
      if (error.response) {
        console.error('에러 응답:', error.response.data);
        console.error('에러 상태:', error.response.status);
      }
      return [];
    }
  };

  // 도시명을 지역코드로 변환
  const getAreaCode = (cityName: string) => {
    const cityMap: { [key: string]: string } = {
      'Seoul': '1', 'Busan': '6', 'Incheon': '2', 'Daegu': '3', 'Daejeon': '4',
      'Gwangju': '5', 'Suwon': '31', 'Ulsan': '7', 'Seongnam': '31', 'Bucheon': '2',
      'Goyang': '31', 'Yongin': '31', 'Ansan': '31', 'Anyang': '31', 'Pohang': '35', 'Jeonju': '37',
      'Changwon': '38', 'Jeju': '39', 'Gimhae': '38', 'Gumi': '35', 'Gunpo': '31', 'Guri': '31',
      'Gwacheon': '31', 'Gwangmyeong': '31', 'Gyeongju': '35', 'Gyeongsan': '35', 'Hanam': '31',
      'Hwaseong': '31', 'Icheon': '31', 'Iksan': '37', 'Jeongeup': '37', 'Jinju': '38',
      'Miryang': '38', 'Mokpo': '46', 'Namwon': '37', 'Namyangju': '31', 'Nonsan': '44',
      'Osan': '31', 'Paju': '31', 'Pocheon': '31', 'Pyeongtaek': '31', 'Sacheon': '38',
      'Samcheok': '42', 'Sangju': '35', 'Sejong': '25', 'Siheung': '31', 'Suncheon': '46',
      'Tongyeong': '38', 'Wonju': '42', 'Yangju': '31', 'Yangsan': '38', 'Yeoju': '31',
      'Yeongcheon': '35', 'Yeongju': '35', 'Yeosu': '46'
    };
    const areaCode = cityMap[cityName] || '1'; // 기본값은 서울
    console.log(`도시: ${cityName} -> 지역코드: ${areaCode}`);
    return areaCode;
  };

      return (
             <div className={`weather-app-container ${weatherData ? getWeatherBackground(weatherData.current.condition.text) : 'weather-app-container--default'} transition-all duration-1000`}>
       <div className="weather-app">
         {/* Header */}
         <div className="weather-app__header">
                      <h1>
              한국 날씨
            </h1>
          <p>실시간 날씨 정보를 확인하세요</p>
                     <p className="weather-app__time">
             {isClient && currentTime ? (
               <>
                 {currentTime.toLocaleDateString('ko-KR', { 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric', 
                   weekday: 'long' 
                 })} • {currentTime.toLocaleTimeString('ko-KR', { 
                   hour: '2-digit', 
                   minute: '2-digit' 
                 })}
               </>
             ) : (
               <span>로딩 중...</span>
             )}
           </p>
        </div>

        {/* Search Form */}
        <div className="weather-app__card">
          <div className="weather-app__search">
            <form onSubmit={handleSubmit} className="weather-app__search-form">
              <div className="weather-app__search-input-wrapper">
                <Search className="weather-app__search-icon" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="도시명을 입력하세요 (예: 서울, 부산, 인천...)"
                  className="weather-app__search-input"
                />
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="weather-app__search-suggestions">
                    {(() => {
                      if (city.length === 0) {
                        return (
                          <>
                            {searchHistory.length > 0 ? (
                              <>
                                <div className="weather-app__suggestion-category">
                                  최근 검색
                                </div>
                                {searchHistory.map((item, index) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setCity(item);
                                      setShowSuggestions(false);
                                      fetchWeather(item);
                                    }}
                                    className="weather-app__suggestion-item"
                                  >
                                    <MapPin className="weather-app__suggestion-icon" />
                                    <span>{item}</span>
                                  </button>
                                ))}
                                <div className="weather-app__suggestion-category">
                                  인기 도시 (한국)
                                </div>
                              </>
                            ) : (
                              <div className="weather-app__suggestion-category">
                                인기 도시 (한국)
                              </div>
                            )}
                            {popularCities.slice(0, 5).map((cityName) => (
                              <button
                                key={cityName}
                                onClick={() => {
                                  setCity(getKoreanCityName(cityName));
                                  setShowSuggestions(false);
                                  // 영어 도시명으로 API 호출
                                  fetchWeather(cityName);
                                }}
                                className="weather-app__suggestion-item"
                              >
                                <MapPin className="weather-app__suggestion-icon" />
                                <span>{getKoreanCityName(cityName)}</span>
                              </button>
                            ))}
                          </>
                        );
                      }
                      
                      // 한국어 검색 지원
                      const filteredCities = popularCities.filter(cityName => {
                        const koreanName = getKoreanCityName(cityName);
                        return cityName.toLowerCase().includes(city.toLowerCase()) || 
                               koreanName.includes(city) ||
                               koreanName.toLowerCase().includes(city.toLowerCase());
                      });
                      
                      if (filteredCities.length === 0) {
                        return (
                          <div className="px-4 py-3 text-gray-500 text-sm text-center">
                            일치하는 도시를 찾을 수 없습니다
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          {(() => {
                            const historyMatches = searchHistory.filter(item => 
                              item.toLowerCase().includes(city.toLowerCase())
                            );
                            
                            if (historyMatches.length > 0) {
                              return (
                                <>
                                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                                    최근 검색에서 찾음 ({historyMatches.length})
                                  </div>
                                  {historyMatches.map((item, index) => (
                                    <button
                                      key={`history-${index}`}
                                      onClick={() => {
                                        setCity(item);
                                        setShowSuggestions(false);
                                        fetchWeather(item);
                                      }}
                                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2 bg-blue-50"
                                    >
                                      <MapPin className="w-4 h-4 text-blue-400" />
                                      <span className="text-blue-700">{item}</span>
                                    </button>
                                  ))}
                                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                                    인기 도시 (한국)에서 찾음 ({filteredCities.length})
                                  </div>
                                </>
                              );
                            }
                            
                            return (
                              <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                                검색 결과 (한국 도시) ({filteredCities.length})
                              </div>
                            );
                          })()}
                          {filteredCities.map((cityName) => {
                            const koreanName = getKoreanCityName(cityName);
                            const regex = new RegExp(`(${city})`, 'gi');
                            const parts = koreanName.split(regex);
                            
                            return (
                              <button
                                key={cityName}
                                onClick={() => {
                                  setCity(koreanName);
                                  setShowSuggestions(false);
                                  // 영어 도시명으로 API 호출
                                  fetchWeather(cityName);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2"
                              >
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>
                                  {parts.map((part, index) => 
                                    regex.test(part) ? (
                                      <span key={index} className="font-semibold text-blue-600">{part}</span>
                                    ) : (
                                      part
                                    )
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="search-button"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    검색중...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    검색
                  </>
                )}
              </button>
            </form>
            
            {/* Search History & Suggestions */}
            <div className="search-history-section">
              {searchHistory.length > 0 && (
                <div className="mb-3">
                  <p className="history-title">최근 검색:</p>
                  <div className="history-buttons">
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCity(item);
                          fetchWeather(item);
                        }}
                        className="history-btn"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="popular-cities-section">
                <p className="cities-title">인기 도시 (한국):</p>
                <div className="cities-buttons">
                  {popularCities.slice(0, 5).map((cityName) => (
                    <button
                      key={cityName}
                      onClick={() => {
                        setCity(getKoreanCityName(cityName));
                        fetchWeather(cityName);
                      }}
                      className="city-btn"
                    >
                      {getKoreanCityName(cityName)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
                 {error && (
           <div className="max-w-2xl mx-auto mb-8">
             <div className="weather-app__card weather-app__error fade-in">
                             <div className="flex items-start gap-3">
                 <div className="error-icon w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                 <div className="flex-1">
                   <h3 className="error-title mb-2">오류가 발생했습니다</h3>
                   <p className="error-message">{error}</p>
                                     {error.includes('도시를 찾을 수 없습니다') && (
                     <div className="mt-3 p-3 bg-red-100 rounded-lg">
                       <p className="text-sm text-red-800 font-medium mb-2">해결 방법:</p>
                                               <ol className="text-xs text-red-700 space-y-1">
                          <li>1. 한국 도시명을 입력해보세요 (예: 서울, 부산, 인천, 대구, 대전)</li>
                          <li>2. 정확한 도시명을 확인해보세요</li>
                          <li>3. 아래 인기 도시 버튼을 클릭해보세요</li>
                        </ol>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Display */}
                 {loading && (
           <div className="max-w-6xl mx-auto space-y-6">
             {/* Loading Skeleton */}
             <div className="weather-app__card weather-app__loading">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                                       <div className="skeleton-item w-6 h-6"></div>
                   <div>
                     <div className="skeleton-item w-32 h-8 mb-2"></div>
                     <div className="skeleton-item w-24 h-4"></div>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-4 mb-6">
                   <div className="skeleton-item w-24 h-16"></div>
                   <div className="flex flex-col gap-2">
                     <div className="skeleton-item w-12 h-6"></div>
                     <div className="skeleton-item w-12 h-6"></div>
                   </div>
                 </div>
                 
                 <div className="skeleton-item w-48 h-6 mb-2"></div>
                 <div className="skeleton-item w-32 h-4"></div>
                </div>
                
                                 <div className="grid grid-cols-2 gap-4">
                   {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                       <div className="skeleton-item w-8 h-8 mx-auto mb-2"></div>
                       <div className="skeleton-item w-16 h-8 mx-auto mb-2"></div>
                       <div className="skeleton-item w-20 h-4 mx-auto"></div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        )}
        
        {weatherData && !loading && (
          <div className="max-w-6xl mx-auto space-y-6">
                         {/* Current Weather Card */}
             <div className="weather-app__card weather-card fade-in">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-6 h-6 text-red-500" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{weatherData.location.name}</h2>
                      <p className="text-gray-600">{weatherData.location.country}</p>
                    </div>
                  </div>
                  
                                                                          <div className="temperature-display mb-6">
                    {/* 날씨 아이콘을 위에 배치 */}
                    <div className="weather-icon-large mb-4">
                      {getWeatherIcon(weatherData.current.condition.text)}
                    </div>
                    
                    {/* 온도와 토글 버튼을 가로로 배치 */}
                    <div className="flex items-center justify-center gap-6">
                      <div className="temp-value">
                        {isCelsius ? weatherData.current.temp_c.toFixed(1) : weatherData.current.temp_f.toFixed(1)}°
                      </div>
                      <div className="temp-toggle">
                        <button
                          onClick={() => setIsCelsius(true)}
                          className={`${isCelsius ? 'active' : ''}`}
                        >
                          °C
                        </button>
                        <button
                          onClick={() => setIsCelsius(false)}
                          className={`${!isCelsius ? 'active' : ''}`}
                        >
                          °F
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xl text-gray-700 mb-2">{getKoreanWeatherText(weatherData.current.condition.text)}</p>
                  <div className="space-y-1 text-sm text-gray-500">
                                         <p>체감온도: {isCelsius ? weatherData.current.feelslike_c.toFixed(1) : weatherData.current.feelslike_f.toFixed(1)}°</p>
                    <p>기압: {weatherData.current.pressure_mb} hPa</p>
                    <p>마지막 업데이트: {isClient ? new Date(weatherData.current.last_updated).toLocaleString('ko-KR') : weatherData.current.last_updated}</p>
                  </div>
                </div>
                
                                                   <div className="weather-stats">
                    <div className="stat-item">
                      <Thermometer className="stat-icon w-8 h-8" />
                      <p className="stat-value">
                        {isCelsius ? weatherData.current.temp_c.toFixed(1) : weatherData.current.temp_f.toFixed(1)}°
                      </p>
                      <p className="stat-label">현재온도</p>
                    </div>
                    <div className="stat-item">
                      <Thermometer className="stat-icon w-8 h-8" />
                      <p className="stat-value">
                        {isCelsius ? weatherData.current.feelslike_c.toFixed(1) : weatherData.current.feelslike_f.toFixed(1)}°
                      </p>
                      <p className="stat-label">체감온도</p>
                    </div>
                    <div className="stat-item">
                      <Droplets className="stat-icon w-8 h-8" />
                      <p className="stat-value">{weatherData.current.humidity}%</p>
                      <p className="stat-label">습도</p>
                    </div>
                    <div className="stat-item">
                      <Wind className="stat-icon w-8 h-8" />
                      <p className="stat-value">
                        {isCelsius ? weatherData.current.wind_kph.toFixed(1) : weatherData.current.wind_mph.toFixed(1)}
                      </p>
                      <p className="stat-label">바람속도</p>
                    </div>
                    <div className="stat-item">
                      <Eye className="stat-icon w-8 h-8" />
                      <p className="stat-value">{weatherData.current.vis_km}km</p>
                      <p className="stat-label">가시거리</p>
                    </div>
                    <div className="stat-item">
                      <Cloud className="stat-icon w-8 h-8" />
                      <p className="stat-value">{weatherData.current.pressure_mb}</p>
                      <p className="stat-label">기압(hPa)</p>
                    </div>
                  </div>
              </div>
            </div>

                         {/* Sunrise/Sunset Card */}
             <div className="weather-app__card fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">일출/일몰 시간</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6">
                  <Sunrise className="w-8 h-8 text-orange-500" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">일출</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatTime(weatherData.forecast.forecastday[0].astro.sunrise)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <Sunset className="w-8 h-8 text-purple-500" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">일몰</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatTime(weatherData.forecast.forecastday[0].astro.sunset)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

                                                   {/* 5-Day Forecast */}
                             <div className="weather-app__card forecast-card fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">5일 예보</h3>
                              <div className="weather-app__forecast-grid">
                                  {weatherData.forecast.forecastday.map((day, index) => (
                    <div key={day.date} className="forecast-item text-center">
                     <p className="text-sm text-gray-600 mb-2 font-medium">
                       {index === 0 ? '오늘' : new Date(day.date).toLocaleDateString('ko-KR', { weekday: 'short' })}
                     </p>
                     <p className="text-xs text-gray-500 mb-2">
                       {new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                     </p>
                                                               <div className="weather-icon">
                         {getWeatherIcon(day.day.condition.text)}
                       </div>
                                                               <div className="temp-range">
                                                 <p className="max-temp">
                            {isCelsius ? day.day.maxtemp_c.toFixed(1) : day.day.temp_f.toFixed(1)}°
                          </p>
                          <p className="min-temp">
                            {isCelsius ? day.day.mintemp_c.toFixed(1) : ((day.day.mintemp_c * 9/5) + 32).toFixed(1)}°
                          </p>
                       </div>
                      <p className="text-xs text-gray-500 mb-2">{getKoreanWeatherText(day.day.condition.text)}</p>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>습도: {day.day.humidity}%</p>
                                                <p>바람: {isCelsius ? day.day.wind_kph.toFixed(1) : (day.day.wind_kph * 0.621371).toFixed(1)} {isCelsius ? 'km/h' : 'mph'}</p>
                      </div>
                   </div>
                 ))}
               </div>
             </div>

                                                   {/* 행사/축제 정보 */}
              {festivalData.length > 0 && (
                <div className="weather-app__card festival-card fade-in">
                 <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">🎉 지역 행사 & 축제</h3>
                                  <div className="weather-app__festival-grid">
                                      {(showAllFestivals ? festivalData : festivalData.slice(0, 6)).map((festival, index) => (
                      <div key={index} className="festival-item">
                                              {festival.imageUrl && (
                          <div className="festival-image">
                            <img 
                              src={festival.imageUrl} 
                              alt={festival.title}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <h4 className="festival-title line-clamp-2">{festival.title}</h4>
                        <div className="festival-details">
                          <p>📅 {festival.startDate} ~ {festival.endDate}</p>
                          <p>📍 {festival.location}</p>
                          <p className="line-clamp-2">{festival.description}</p>
                        </div>
                     </div>
                   ))}
                 </div>
                 {festivalData.length > 6 && (
                   <div className="text-center mt-4">
                     <button
                       onClick={() => setShowAllFestivals(!showAllFestivals)}
                       className="px-6 py-2 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg hover:from-purple-700 hover:to-orange-700 transition-all duration-200 font-medium"
                     >
                       {showAllFestivals ? '접기' : `더보기 (${festivalData.length - 6}개 더)`}
                     </button>
                     <p className="text-sm text-gray-500 mt-2">총 {festivalData.length}개의 행사가 있습니다</p>
                   </div>
                 )}
               </div>
             )}
          </div>
        )}

                                   {/* No Data State */}
          {!weatherData && !loading && !error && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="weather-app__card fade-in">
               <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Cloud className="w-12 h-12 text-blue-500" />
               </div>
               <h3 className="text-2xl font-bold text-gray-700 mb-3">현재 위치 날씨 정보를 가져오는 중...</h3>
               <p className="text-gray-600 mb-6 text-lg">IP 기반으로 현재 위치를 파악하여 자동으로 날씨 정보를 표시합니다.</p>
               
               <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto">
                 <p className="text-sm text-green-700">
                   💡 <strong>자동 위치 감지:</strong> 접속한 위치의 날씨 정보를 자동으로 표시합니다
                 </p>
                 <p className="text-xs text-green-600 mt-2">
                   수동으로 다른 도시를 검색하거나, 인기 도시 중 하나를 선택할 수도 있습니다.
                 </p>
               </div>
               
                               <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">또는 수동으로 도시 검색:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {popularCities.slice(0, 5).map((cityName) => (
                      <button
                        key={cityName}
                        onClick={() => {
                          setCity(getKoreanCityName(cityName));
                          fetchWeather(cityName);
                        }}
                        className="city-btn"
                      >
                        {getKoreanCityName(cityName)}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
