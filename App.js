import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, Image, Vibration } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const Stack = createStackNavigator();

// Importar la imagen del logo
const heartbeatLogo = require('./assets/heartbeat_logo.png');

// Hook personalizado para la funcionalidad dual
const useDualPress = (onQuickPress, vibrationDuration = 500) => {
    const [isPressing, setIsPressing] = useState(false);
    const pressTimer = useRef(null);

    const handlePressIn = () => {
        setIsPressing(true);
        
        // Iniciar el temporizador para vibración después de 5 segundos
        pressTimer.current = setTimeout(() => {
            Vibration.vibrate(vibrationDuration);
            setIsPressing(false);
        }, 5000);
    };

    const handlePressOut = () => {
        setIsPressing(false);
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    const handleQuickPress = () => {
        if (onQuickPress) {
            onQuickPress();
        }
    };

    return {
        isPressing,
        handlePressIn,
        handlePressOut,
        handleQuickPress
    };
};

// Pantalla de Inicio
function HomeScreen({ navigation }) {
    const { isPressing, handlePressIn, handlePressOut, handleQuickPress } = useDualPress(
        () => navigation.navigate('Login')
    );

    return (
        <View style={styles.screenContainer}>
            <View style={styles.contentFrame}>
                <View style={styles.homeContainer}>
                    {/* Logo en la pantalla de bienvenida */}
                    <View style={styles.homeLogoSection}>
                        <Image 
                            source={heartbeatLogo} 
                            style={styles.homeLogoImage}
                            resizeMode="contain"
                        />
                    </View>
                    
                    <Text style={styles.homeTitle}>Bienvenido a Health Reminder</Text>
                    
                    <Text style={styles.instructionText}>
                        {isPressing 
                            ? 'Mantén presionado para vibración...' 
                            : 'Toca para iniciar • Mantén 5s para vibración'
                        }
                    </Text>
                    
                    <Pressable 
                        style={({ pressed }) => [
                            styles.navButton,
                            pressed && styles.navButtonPressed,
                            isPressing && styles.navButtonActive
                        ]}
                        onPress={handleQuickPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        delayLongPress={5000}
                    >
                        <Text style={styles.buttonText}>
                            {isPressing ? 'Suelta para cancelar vibración' : 'Iniciar Health Reminder'}
                        </Text>
                    </Pressable>
                    
                    <StatusBar style="auto" />
                </View>
            </View>
        </View>
    );
}

// Pantalla de Login
function LoginScreen({ navigation }) {
    const [claveUnica, setClaveUnica] = useState('');
    const [contrasena, setContrasena] = useState('');

    const { isPressing, handlePressIn, handlePressOut, handleQuickPress } = useDualPress(
        () => {
            if (claveUnica && contrasena) {
                alert(`Ingreso exitoso\nClave: ${claveUnica}`);
                navigation.navigate('MainApp');
            } else {
                alert('Por favor ingresa tu clave única y contraseña');
            }
        }
    );

    return (
        <View style={styles.screenContainer}>
            <View style={styles.contentFrame}>
                <View style={styles.loginContainer}>
                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <Image 
                            source={heartbeatLogo} 
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Login Section */}
                    <View style={styles.loginForm}>
                        <Text style={styles.sectionTitle}>Ingresar a Health Reminder</Text>
                        
                        <Text style={styles.label}>Clave Unica</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ingresa tu clave única"
                            placeholderTextColor="#666"
                            value={claveUnica}
                            onChangeText={setClaveUnica}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        
                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ingresa tu contraseña"
                            placeholderTextColor="#666"
                            value={contrasena}
                            onChangeText={setContrasena}
                            secureTextEntry={true}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        
                        <Pressable 
                            style={({ pressed }) => [
                                styles.button,
                                pressed && styles.buttonPressed,
                                isPressing && styles.navButtonActive
                            ]}
                            onPress={handleQuickPress}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            delayLongPress={5000}
                        >
                            <Text style={styles.buttonText}>
                                {isPressing ? 'Mantén para vibración...' : 'Ingresar'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

// Pantalla Principal después del Login
function MainAppScreen({ navigation }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const weekDays = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

    // Hook para controles del calendario
    const controlDualPress = useDualPress();

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (increment) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setCurrentDate(newDate);
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        
        // Días vacíos al inicio
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
        }
        
        // Días del mes
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = new Date().getDate() === i && 
                           new Date().getMonth() === currentDate.getMonth() && 
                           new Date().getFullYear() === currentDate.getFullYear();
            
            days.push(
                <View key={i} style={[styles.calendarDay, isToday && styles.todayDay]}>
                    <Text style={[styles.dayText, isToday && styles.todayText]}>{i}</Text>
                </View>
            );
        }
        
        return days;
    };

    // Hooks para navegación inferior
    const navCalendar = useDualPress(() => navigation.navigate('MainApp'));
    const navRequest = useDualPress(() => navigation.navigate('RequestAppointment'));
    const navPrescription = useDualPress(() => navigation.navigate('Prescription'));
    const navProfile = useDualPress(() => navigation.navigate('Profile'));

    return (
        <View style={styles.screenContainer}>
            <View style={styles.contentFrame}>
                <View style={styles.container}>
                    <ScrollView style={styles.scrollContent}>
                        {/* Espacio superior invisible */}
                        <View style={styles.invisiblePadding} />
                        
                        {/* Calendario Médico Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Calendario Health Reminder</Text>
                            
                            {/* Controles del calendario */}
                            <View style={styles.calendarControls}>
                                <Pressable 
                                    onPress={() => changeMonth(-1)} 
                                    style={styles.controlButton}
                                    onPressIn={controlDualPress.handlePressIn}
                                    onPressOut={controlDualPress.handlePressOut}
                                    delayLongPress={5000}
                                >
                                    <Ionicons name="chevron-back" size={20} color="#007AFF" />
                                </Pressable>
                                
                                <Text style={styles.monthYear}>
                                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </Text>
                                
                                <Pressable 
                                    onPress={() => changeMonth(1)} 
                                    style={styles.controlButton}
                                    onPressIn={controlDualPress.handlePressIn}
                                    onPressOut={controlDualPress.handlePressOut}
                                    delayLongPress={5000}
                                >
                                    <Ionicons name="chevron-forward" size={20} color="#007AFF" />
                                </Pressable>
                            </View>
                            
                            {/* Calendar Grid */}
                            <View style={styles.calendarWrapper}>
                                {/* Días de la semana */}
                                <View style={styles.weekDaysRow}>
                                    {weekDays.map((day, index) => (
                                        <View key={day} style={styles.weekDayContainer}>
                                            <Text style={styles.weekDay}>{day}</Text>
                                        </View>
                                    ))}
                                </View>
                                
                                {/* Días del mes */}
                                <View style={styles.calendarGrid}>
                                    {renderCalendar()}
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Hoy Section */}
                        <View style={styles.section}>
                            <View style={styles.todayHeader}>
                                <Text style={styles.todayBullet}>●</Text>
                                <Text style={styles.todayTitle}>Hoy</Text>
                            </View>
                            
                            <Text style={styles.todaySubtitle}>Recordatorios de medicamentos y horarios</Text>
                            
                            <View style={styles.medicationList}>
                                <View style={styles.medicationItem}>
                                    <Text style={[styles.medicationName, styles.paracetamol]}>Paracetamol</Text>
                                    <Text style={styles.medicationTime}>8:00</Text>
                                </View>
                                
                                <View style={styles.medicationItem}>
                                    <Text style={[styles.medicationName, styles.ibuprofeno]}>Ibuprofeno</Text>
                                    <Text style={styles.medicationTime}>12:00</Text>
                                </View>
                                
                                <View style={styles.medicationItem}>
                                    <Text style={[styles.medicationName, styles.naproxeno]}>Naproxeno</Text>
                                    <Text style={styles.medicationTime}>15:00</Text>
                                </View>
                                
                                <View style={styles.medicationItem}>
                                    <Text style={[styles.medicationName, styles.tempra]}>Tempra</Text>
                                    <Text style={styles.medicationTime}>20:00</Text>
                                </View>
                            </View>
                        </View>

                        {/* Espacio inferior invisible - MÁS GRANDE */}
                        <View style={styles.extraBottomPadding} />
                    </ScrollView>

                    {/* Navegación inferior */}
                    <View style={styles.bottomNavigation}>
                        <Pressable 
                            style={styles.navItem}
                            onPress={navCalendar.handleQuickPress}
                            onPressIn={navCalendar.handlePressIn}
                            onPressOut={navCalendar.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="calendar" size={24} color="#007AFF" />
                            <Text style={[styles.navText, styles.activeNavText]}>Calendario{"\n"}Health</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navRequest.handleQuickPress}
                            onPressIn={navRequest.handlePressIn}
                            onPressOut={navRequest.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="add-circle" size={24} color="#666" />
                            <Text style={styles.navText}>Solicitar{"\n"}Consulta</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navPrescription.handleQuickPress}
                            onPressIn={navPrescription.handlePressIn}
                            onPressOut={navPrescription.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="document-text" size={24} color="#666" />
                            <Text style={styles.navText}>Receta</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navProfile.handleQuickPress}
                            onPressIn={navProfile.handlePressIn}
                            onPressOut={navProfile.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="person" size={24} color="#666" />
                            <Text style={styles.navText}>Perfil</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

// Pantalla de Solicitar Consulta
function RequestAppointmentScreen({ navigation }) {
    const [fechaConsulta, setFechaConsulta] = useState(new Date());
    const [motivoConsulta, setMotivoConsulta] = useState('');
    const [nombreDoctor, setNombreDoctor] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { isPressing: datePressing, handlePressIn: datePressIn, handlePressOut: datePressOut } = useDualPress();
    const { isPressing: submitPressing, handlePressIn: submitPressIn, handlePressOut: submitPressOut, handleQuickPress: submitQuickPress } = useDualPress(
        () => {
            if (motivoConsulta && nombreDoctor) {
                alert('Consulta solicitada exitosamente');
                navigation.navigate('MainApp');
            } else {
                alert('Por favor completa todos los campos');
            }
        }
    );

    // Hooks para navegación
    const navCalendar = useDualPress(() => navigation.navigate('MainApp'));
    const navRequest = useDualPress(() => navigation.navigate('RequestAppointment'));
    const navPrescription = useDualPress(() => navigation.navigate('Prescription'));
    const navProfile = useDualPress(() => navigation.navigate('Profile'));

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFechaConsulta(selectedDate);
        }
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0].replace(/-/g, '/');
    };

    return (
        <View style={styles.screenContainer}>
            <View style={styles.contentFrame}>
                <View style={styles.requestContainer}>
                    <ScrollView contentContainerStyle={styles.requestScrollContent}>
                        {/* Espacio superior invisible */}
                        <View style={styles.invisiblePadding} />
                        
                        {/* Solicitar Consulta Section */}
                        <View style={styles.requestForm}>
                            <Text style={styles.sectionTitle}>Solicitar Consulta - Health Reminder</Text>
                            
                            <Text style={styles.label}>Fecha de la consulta</Text>
                            <Pressable 
                                style={styles.dateInput}
                                onPress={() => setShowDatePicker(true)}
                                onPressIn={datePressIn}
                                onPressOut={datePressOut}
                                delayLongPress={5000}
                            >
                                <Text style={styles.dateInputText}>
                                    {formatDate(fechaConsulta)}
                                </Text>
                                <Ionicons name="calendar" size={20} color="#666" />
                            </Pressable>
                            
                            {showDatePicker && (
                                <DateTimePicker
                                    value={fechaConsulta}
                                    mode="date"
                                    display="default"
                                    onChange={onDateChange}
                                />
                            )}
                            
                            <Text style={styles.label}>Motivo de la Consulta</Text>
                            <TextInput
                                style={[styles.textInput, styles.multilineInput]}
                                placeholder="Describe el motivo de tu consulta"
                                placeholderTextColor="#666"
                                value={motivoConsulta}
                                onChangeText={setMotivoConsulta}
                                multiline={true}
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                            
                            <Text style={styles.label}>Nombre del Doctor Encargado</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Ingresa el nombre del doctor"
                                placeholderTextColor="#666"
                                value={nombreDoctor}
                                onChangeText={setNombreDoctor}
                            />
                            
                            <Pressable 
                                style={({ pressed }) => [
                                    styles.button,
                                    pressed && styles.buttonPressed,
                                    submitPressing && styles.navButtonActive
                                ]}
                                onPress={submitQuickPress}
                                onPressIn={submitPressIn}
                                onPressOut={submitPressOut}
                                delayLongPress={5000}
                            >
                                <Text style={styles.buttonText}>
                                    {submitPressing ? 'Mantén para vibración...' : 'Solicitar'}
                                </Text>
                            </Pressable>
                        </View>

                        {/* Espacio inferior invisible - MÁS GRANDE */}
                        <View style={styles.extraBottomPadding} />
                    </ScrollView>

                    {/* Navegación inferior */}
                    <View style={styles.bottomNavigation}>
                        <Pressable 
                            style={styles.navItem}
                            onPress={navCalendar.handleQuickPress}
                            onPressIn={navCalendar.handlePressIn}
                            onPressOut={navCalendar.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="calendar" size={24} color="#666" />
                            <Text style={styles.navText}>Calendario{"\n"}Health</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navRequest.handleQuickPress}
                            onPressIn={navRequest.handlePressIn}
                            onPressOut={navRequest.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="add-circle" size={24} color="#007AFF" />
                            <Text style={[styles.navText, styles.activeNavText]}>Solicitar{"\n"}Consulta</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navPrescription.handleQuickPress}
                            onPressIn={navPrescription.handlePressIn}
                            onPressOut={navPrescription.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="document-text" size={24} color="#666" />
                            <Text style={styles.navText}>Receta</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navProfile.handleQuickPress}
                            onPressIn={navProfile.handlePressIn}
                            onPressOut={navProfile.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="person" size={24} color="#666" />
                            <Text style={styles.navText}>Perfil</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

// Pantalla de Receta
function PrescriptionScreen({ navigation }) {
    // Hooks para las tarjetas
    const card1 = useDualPress();
    const card2 = useDualPress();
    const card3 = useDualPress();
    const card4 = useDualPress();

    // Hooks para navegación
    const navCalendar = useDualPress(() => navigation.navigate('MainApp'));
    const navRequest = useDualPress(() => navigation.navigate('RequestAppointment'));
    const navPrescription = useDualPress(() => navigation.navigate('Prescription'));
    const navProfile = useDualPress(() => navigation.navigate('Profile'));

    return (
        <View style={styles.screenContainer}>
            <View style={styles.contentFrame}>
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.prescriptionScrollContent}>
                        {/* Espacio superior invisible */}
                        <View style={styles.invisiblePadding} />
                        
                        {/* Receta Section */}
                        <View style={styles.prescriptionContainer}>
                            <Text style={styles.sectionTitle}>Receta - Health Reminder</Text>
                            
                            {/* Recuadro de Fecha de Emisión */}
                            <Pressable 
                                style={styles.infoCard}
                                onPressIn={card1.handlePressIn}
                                onPressOut={card1.handlePressOut}
                                delayLongPress={5000}
                            >
                                <Text style={styles.cardTitle}>Fecha de Emisión</Text>
                                <Text style={styles.cardContent}>29/10/2025</Text>
                            </Pressable>
                            
                            {/* Recuadro de Diagnóstico */}
                            <Pressable 
                                style={styles.infoCard}
                                onPressIn={card2.handlePressIn}
                                onPressOut={card2.handlePressOut}
                                delayLongPress={5000}
                            >
                                <Text style={styles.cardTitle}>Diagnóstico</Text>
                                <Text style={styles.cardContent}>Infección respiratoria superior</Text>
                            </Pressable>
                            
                            {/* Recuadro de Observación */}
                            <Pressable 
                                style={styles.infoCard}
                                onPressIn={card3.handlePressIn}
                                onPressOut={card3.handlePressOut}
                                delayLongPress={5000}
                            >
                                <Text style={styles.cardTitle}>Observación</Text>
                                <Text style={styles.cardContent}>
                                    Paciente con fiebre y tos persistente, se recomienda reposo y aumento de líquidos.
                                </Text>
                            </Pressable>
                            
                            {/* Recuadro de Medicamentos */}
                            <Pressable 
                                style={styles.infoCard}
                                onPressIn={card4.handlePressIn}
                                onPressOut={card4.handlePressOut}
                                delayLongPress={5000}
                            >
                                <Text style={styles.cardTitle}>Medicamentos</Text>
                                
                                <View style={styles.medicationItemPrescription}>
                                    <Text style={[styles.medicationName, styles.paracetamol]}>Paracetamol 500mg</Text>
                                    <Text style={styles.medicationDosage}>1 cápsula cada 8 horas - Duración: 7 días</Text>
                                </View>
                                
                                <View style={styles.medicationItemPrescription}>
                                    <Text style={[styles.medicationName, styles.ibuprofeno]}>Ibuprofeno 500mg</Text>
                                    <Text style={styles.medicationDosage}>1 cápsula cada 24 horas - Duración: 10 días</Text>
                                </View>
                                
                                <View style={styles.medicationItemPrescription}>
                                    <Text style={[styles.medicationName, styles.naproxeno]}>Naproxeno 500mg</Text>
                                    <Text style={styles.medicationDosage}>1 cápsula cada 12 horas - Duración: 3 días</Text>
                                </View>
                                
                                <View style={styles.medicationItemPrescription}>
                                    <Text style={[styles.medicationName, styles.tempra]}>Tempra 250mg</Text>
                                    <Text style={styles.medicationDosage}>1 cápsula cada 12 horas - Duración: 2 días</Text>
                                </View>
                            </Pressable>
                        </View>

                        {/* Espacio inferior invisible - MÁS GRANDE */}
                        <View style={styles.extraBottomPadding} />
                    </ScrollView>

                    {/* Navegación inferior */}
                    <View style={styles.bottomNavigation}>
                        <Pressable 
                            style={styles.navItem}
                            onPress={navCalendar.handleQuickPress}
                            onPressIn={navCalendar.handlePressIn}
                            onPressOut={navCalendar.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="calendar" size={24} color="#666" />
                            <Text style={styles.navText}>Calendario{"\n"}Health</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navRequest.handleQuickPress}
                            onPressIn={navRequest.handlePressIn}
                            onPressOut={navRequest.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="add-circle" size={24} color="#666" />
                            <Text style={styles.navText}>Solicitar{"\n"}Consulta</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navPrescription.handleQuickPress}
                            onPressIn={navPrescription.handlePressIn}
                            onPressOut={navPrescription.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="document-text" size={24} color="#007AFF" />
                            <Text style={[styles.navText, styles.activeNavText]}>Receta</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navProfile.handleQuickPress}
                            onPressIn={navProfile.handlePressIn}
                            onPressOut={navProfile.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="person" size={24} color="#666" />
                            <Text style={styles.navText}>Perfil</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

// Pantalla de Perfil
function ProfileScreen({ navigation }) {
    // Hooks para botones del header
    const changePassword = useDualPress(() => navigation.navigate('ChangePassword'));
    const logout = useDualPress(() => {
        alert('Sesión cerrada exitosamente');
        navigation.navigate('Login');
    }, 200); // Vibración corta al logout

    // Hooks para elementos del perfil
    const photo = useDualPress();
    const personalInfo = useDualPress();
    const medicalInfo = useDualPress();

    // Hooks para navegación
    const navCalendar = useDualPress(() => navigation.navigate('MainApp'));
    const navRequest = useDualPress(() => navigation.navigate('RequestAppointment'));
    const navPrescription = useDualPress(() => navigation.navigate('Prescription'));
    const navProfile = useDualPress(() => navigation.navigate('Profile'));

    return (
        <View style={styles.screenContainer}>
            <View style={styles.contentFrame}>
                <View style={styles.container}>
                    {/* Header con botones */}
                    <View style={styles.profileHeader}>
                        <View style={styles.headerButtons}>
                            <Pressable 
                                style={styles.changePasswordButton}
                                onPress={changePassword.handleQuickPress}
                                onPressIn={changePassword.handlePressIn}
                                onPressOut={changePassword.handlePressOut}
                                delayLongPress={5000}
                            >
                                <Ionicons name="key" size={20} color="#007AFF" />
                                <Text style={styles.changePasswordText}>Cambiar Contraseña</Text>
                            </Pressable>
                            
                            <Pressable 
                                style={styles.logoutButton}
                                onPress={logout.handleQuickPress}
                                onPressIn={logout.handlePressIn}
                                onPressOut={logout.handlePressOut}
                                delayLongPress={5000}
                            >
                                <Ionicons name="log-out" size={20} color="#FF3B30" />
                                <Text style={styles.logoutText}>Cerrar Sesión</Text>
                            </Pressable>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={styles.profileScrollContent}>
                        {/* Espacio superior invisible */}
                        <View style={styles.invisiblePadding} />
                        
                        {/* Perfil Section */}
                        <View style={styles.profileContainer}>
                            <Text style={styles.sectionTitle}>Perfil - Health Reminder</Text>
                            
                            {/* Foto de Perfil */}
                            <Pressable 
                                style={styles.profilePhotoContainer}
                                onPressIn={photo.handlePressIn}
                                onPressOut={photo.handlePressOut}
                                delayLongPress={5000}
                            >
                                <View style={styles.profilePhoto}>
                                    <Ionicons name="person" size={60} color="#fff" />
                                </View>
                                <Text style={styles.profileName}>Rafael Flores Lopez</Text>
                                <Text style={styles.profileEmail}>rafael.flores@email.com</Text>
                            </Pressable>
                            
                            {/* Información Personal */}
                            <Pressable 
                                style={styles.infoCard}
                                onPressIn={personalInfo.handlePressIn}
                                onPressOut={personalInfo.handlePressOut}
                                delayLongPress={5000}
                            >
                                <Text style={styles.cardTitle}>Información Personal</Text>
                                
                                <View style={styles.profileGrid}>
                                    <View style={styles.profileField}>
                                        <Text style={styles.fieldLabel}>Nombre(s)</Text>
                                        <Text style={styles.fieldValue}>Rafael</Text>
                                    </View>
                                    
                                    <View style={styles.profileField}>
                                        <Text style={styles.fieldLabel}>Apellidos</Text>
                                        <Text style={styles.fieldValue}>Flores Lopez</Text>
                                    </View>
                                    
                                    <View style={styles.profileField}>
                                        <Text style={styles.fieldLabel}>Sexo</Text>
                                        <Text style={styles.fieldValue}>Hombre</Text>
                                    </View>
                                    
                                    <View style={styles.profileField}>
                                        <Text style={styles.fieldLabel}>Número Telefónico</Text>
                                        <Text style={styles.fieldValue}>222 402 9740</Text>
                                    </View>
                                    
                                    <View style={styles.profileField}>
                                        <Text style={styles.fieldLabel}>Dirección</Text>
                                        <Text style={styles.fieldValue}>AAAAAAA</Text>
                                    </View>
                                    
                                    <View style={styles.profileField}>
                                        <Text style={styles.fieldLabel}>Fecha de Nacimiento</Text>
                                        <Text style={styles.fieldValue}>12/09/2006</Text>
                                    </View>
                                </View>
                            </Pressable>

                            {/* Información Médica */}
                            <Pressable 
                                style={styles.infoCard}
                                onPressIn={medicalInfo.handlePressIn}
                                onPressOut={medicalInfo.handlePressOut}
                                delayLongPress={5000}
                            >
                                <Text style={styles.cardTitle}>Información Médica</Text>
                                
                                <View style={styles.profileField}>
                                    <Text style={styles.fieldLabel}>Enfermedades Crónicas</Text>
                                    <Text style={styles.fieldValue}>Diabetes Tipo 45</Text>
                                </View>
                                
                                <View style={styles.profileField}>
                                    <Text style={styles.fieldLabel}>Tipo de Sangre</Text>
                                    <Text style={styles.fieldValue}>O+</Text>
                                </View>
                                
                                <View style={styles.profileField}>
                                    <Text style={styles.fieldLabel}>Alergias</Text>
                                    <Text style={styles.fieldValue}>Ninguna</Text>
                                </View>
                            </Pressable>
                        </View>

                        {/* Espacio inferior invisible - MÁS GRANDE */}
                        <View style={styles.extraBottomPadding} />
                    </ScrollView>

                    {/* Navegación inferior */}
                    <View style={styles.bottomNavigation}>
                        <Pressable 
                            style={styles.navItem}
                            onPress={navCalendar.handleQuickPress}
                            onPressIn={navCalendar.handlePressIn}
                            onPressOut={navCalendar.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="calendar" size={24} color="#666" />
                            <Text style={styles.navText}>Calendario{"\n"}Health</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navRequest.handleQuickPress}
                            onPressIn={navRequest.handlePressIn}
                            onPressOut={navRequest.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="add-circle" size={24} color="#666" />
                            <Text style={styles.navText}>Solicitar{"\n"}Consulta</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navPrescription.handleQuickPress}
                            onPressIn={navPrescription.handlePressIn}
                            onPressOut={navPrescription.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="document-text" size={24} color="#666" />
                            <Text style={styles.navText}>Receta</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navProfile.handleQuickPress}
                            onPressIn={navProfile.handlePressIn}
                            onPressOut={navProfile.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="person" size={24} color="#007AFF" />
                            <Text style={[styles.navText, styles.activeNavText]}>Perfil</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

// Pantalla de Cambiar Contraseña
function ChangePasswordScreen({ navigation }) {
    const [contrasenaActual, setContrasenaActual] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');

    const { isPressing: cardPressing, handlePressIn: cardPressIn, handlePressOut: cardPressOut } = useDualPress();
    const { isPressing: submitPressing, handlePressIn: submitPressIn, handlePressOut: submitPressOut, handleQuickPress: submitQuickPress } = useDualPress(
        () => {
            if (contrasenaActual && nuevaContrasena && confirmarContrasena) {
                if (nuevaContrasena === confirmarContrasena) {
                    alert('Contraseña actualizada exitosamente');
                    navigation.navigate('Profile');
                } else {
                    alert('Las nuevas contraseñas no coinciden');
                }
            } else {
                alert('Por favor completa todos los campos');
            }
        }
    );

    // Hooks para navegación
    const navCalendar = useDualPress(() => navigation.navigate('MainApp'));
    const navRequest = useDualPress(() => navigation.navigate('RequestAppointment'));
    const navPrescription = useDualPress(() => navigation.navigate('Prescription'));
    const navProfile = useDualPress(() => navigation.navigate('Profile'));

    return (
        <View style={styles.screenContainer}>
            <View style={styles.contentFrame}>
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.passwordScrollContent}>
                        {/* Espacio superior invisible */}
                        <View style={styles.invisiblePadding} />
                        
                        {/* Cambiar Contraseña Section */}
                        <View style={styles.passwordContainer}>
                            <Text style={styles.sectionTitle}>Cambiar Contraseña - Health Reminder</Text>
                            
                            <Pressable 
                                style={[styles.infoCard, cardPressing && styles.navButtonActive]}
                                onPressIn={cardPressIn}
                                onPressOut={cardPressOut}
                                delayLongPress={5000}
                            >
                                <Text style={styles.label}>Contraseña Actual</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Ingresa tu contraseña actual"
                                    placeholderTextColor="#666"
                                    value={contrasenaActual}
                                    onChangeText={setContrasenaActual}
                                    secureTextEntry={true}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                
                                <Text style={styles.label}>Nueva Contraseña</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Ingresa nueva contraseña"
                                    placeholderTextColor="#666"
                                    value={nuevaContrasena}
                                    onChangeText={setNuevaContrasena}
                                    secureTextEntry={true}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                
                                <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Confirma tu nueva contraseña"
                                    placeholderTextColor="#666"
                                    value={confirmarContrasena}
                                    onChangeText={setConfirmarContrasena}
                                    secureTextEntry={true}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                
                                <Pressable 
                                    style={({ pressed }) => [
                                        styles.button,
                                        pressed && styles.buttonPressed,
                                        submitPressing && styles.navButtonActive
                                    ]}
                                    onPress={submitQuickPress}
                                    onPressIn={submitPressIn}
                                    onPressOut={submitPressOut}
                                    delayLongPress={5000}
                                >
                                    <Text style={styles.buttonText}>
                                        {submitPressing ? 'Mantén para vibración...' : 'Actualizar Contraseña'}
                                    </Text>
                                </Pressable>
                            </Pressable>
                        </View>

                        {/* Espacio inferior invisible - MÁS GRANDE */}
                        <View style={styles.extraBottomPadding} />
                    </ScrollView>

                    {/* Navegación inferior */}
                    <View style={styles.bottomNavigation}>
                        <Pressable 
                            style={styles.navItem}
                            onPress={navCalendar.handleQuickPress}
                            onPressIn={navCalendar.handlePressIn}
                            onPressOut={navCalendar.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="calendar" size={24} color="#666" />
                            <Text style={styles.navText}>Calendario{"\n"}Health</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navRequest.handleQuickPress}
                            onPressIn={navRequest.handlePressIn}
                            onPressOut={navRequest.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="add-circle" size={24} color="#666" />
                            <Text style={styles.navText}>Solicitar{"\n"}Consulta</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navPrescription.handleQuickPress}
                            onPressIn={navPrescription.handlePressIn}
                            onPressOut={navPrescription.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="document-text" size={24} color="#666" />
                            <Text style={styles.navText}>Receta</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.navItem}
                            onPress={navProfile.handleQuickPress}
                            onPressIn={navProfile.handlePressIn}
                            onPressOut={navProfile.handlePressOut}
                            delayLongPress={5000}
                        >
                            <Ionicons name="person" size={24} color="#007AFF" />
                            <Text style={[styles.navText, styles.activeNavText]}>Perfil</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

// Componente principal con navegación
export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator 
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#ffffff',
                    },
                    headerTintColor: '#000',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen 
                    name="Home" 
                    component={HomeScreen}
                    options={{ title: 'Health Reminder', headerShown: false }}
                />
                <Stack.Screen 
                    name="Login" 
                    component={LoginScreen}
                    options={{ title: 'Ingresar', headerShown: false }}
                />
                <Stack.Screen 
                    name="MainApp" 
                    component={MainAppScreen}
                    options={{ title: 'Health Reminder', headerShown: false }}
                />
                <Stack.Screen 
                    name="RequestAppointment" 
                    component={RequestAppointmentScreen}
                    options={{ title: 'Solicitar Consulta', headerShown: false }}
                />
                <Stack.Screen 
                    name="Prescription" 
                    component={PrescriptionScreen}
                    options={{ title: 'Receta', headerShown: false }}
                />
                <Stack.Screen 
                    name="Profile" 
                    component={ProfileScreen}
                    options={{ title: 'Perfil', headerShown: false }}
                />
                <Stack.Screen 
                    name="ChangePassword" 
                    component={ChangePasswordScreen}
                    options={{ title: 'Cambiar Contraseña', headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    // Estilos principales con más padding inferior
    screenContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 25,
        paddingBottom: 35,
        paddingHorizontal: 10,
    },
    contentFrame: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    
    // Padding invisible
    invisiblePadding: {
        height: 25,
    },
    extraBottomPadding: {
        height: 40,
    },
    
    // Contenedores con más padding inferior
    homeContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 50,
        paddingHorizontal: 20,
    },
    loginContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    requestContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flex: 1,
    },
    
    // Elementos de UI
    homeTitle: {
        color: '#000',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    instructionText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
        fontStyle: 'italic',
    },
    navButton: {
        backgroundColor: '#007AFF',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
        maxWidth: 300,
    },
    navButtonPressed: {
        backgroundColor: '#0056CC',
        transform: [{ scale: 0.95 }],
    },
    navButtonActive: {
        backgroundColor: '#004499',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonPressed: {
        backgroundColor: '#0056CC',
        transform: [{ scale: 0.95 }],
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    // Logo en Home Screen
    homeLogoSection: {
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    homeLogoImage: {
        width: 150,
        height: 150,
    },
    
    // Login - Logo con imagen MÁS GRANDE
    logoSection: {
        padding: 30,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        marginBottom: 25,
        borderRadius: 10,
        width: '100%',
        maxWidth: 400,
    },
    logoImage: {
        width: 120,
        height: 120,
    },
    loginForm: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#f8f9fa',
        padding: 25,
        borderRadius: 10,
    },
    requestForm: {
        flex: 1,
        justifyContent: 'center',
        padding: 25,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    
    // Sections
    section: {
        padding: 18,
        backgroundColor: '#f8f9fa',
        margin: 12,
        borderRadius: 10,
    },
    sectionTitle: {
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    
    // Calendario
    calendarControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    controlButton: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
    },
    monthYear: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 10,
    },
    calendarWrapper: {
        marginBottom: 10,
    },
    weekDaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 0,
    },
    weekDayContainer: {
        width: '14.28%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekDay: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingHorizontal: 0,
    },
    calendarDay: {
        width: '14.28%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginVertical: 2,
    },
    todayDay: {
        backgroundColor: '#007AFF',
    },
    emptyDay: {
        width: '14.28%',
        height: 40,
        marginVertical: 2,
    },
    dayText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '500',
    },
    todayText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    
    // Hoy section
    todayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    todayBullet: {
        color: '#007AFF',
        fontSize: 16,
        marginRight: 8,
    },
    todayTitle: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    todaySubtitle: {
        color: '#666',
        fontSize: 14,
        marginBottom: 15,
    },
    medicationList: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
    },
    medicationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    medicationName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    medicationTime: {
        color: '#000',
        fontSize: 14,
    },
    
    // Receta
    prescriptionScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 15,
    },
    prescriptionContainer: {
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
        padding: 10,
    },
    medicationItemPrescription: {
        marginBottom: 15,
        paddingLeft: 5,
        borderLeftWidth: 2,
        borderLeftColor: '#e0e0e0',
        paddingLeft: 12,
    },
    medicationDosage: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
        lineHeight: 16,
    },
    
    // Formularios
    label: {
        color: '#000',
        fontSize: 14,
        marginBottom: 5,
        marginTop: 10,
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 5,
        marginBottom: 10,
        color: '#000',
        fontSize: 16,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    dateInput: {
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 5,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInputText: {
        color: '#000',
        fontSize: 16,
    },
    
    // Info cards
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 18,
        marginBottom: 18,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    cardTitle: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardContent: {
        color: '#000',
        fontSize: 14,
        lineHeight: 20,
    },
    
    // Perfil
    profileScrollContent: {
        flexGrow: 1,
        padding: 15,
    },
    profileContainer: {
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
        padding: 10,
    },
    profileHeader: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#f8f9fa',
    },
    headerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    changePasswordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
    },
    changePasswordText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#ffebee',
        borderRadius: 8,
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    profilePhotoContainer: {
        alignItems: 'center',
        marginBottom: 30,
        padding: 25,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileName: {
        color: '#000',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    profileEmail: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
    },
    profileGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    profileField: {
        width: '48%',
        marginBottom: 18,
        paddingBottom: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    fieldLabel: {
        color: '#666',
        fontSize: 12,
        marginBottom: 6,
        fontWeight: '500',
    },
    fieldValue: {
        color: '#000',
        fontSize: 16,
        fontWeight: '500',
    },
    
    // Cambiar contraseña
    passwordScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 15,
    },
    passwordContainer: {
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
        padding: 10,
    },
    
    // Navegación inferior
    bottomNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f8f9fa',
        padding: 12,
    },
    navItem: {
        padding: 5,
        alignItems: 'center',
        flex: 1,
    },
    navText: {
        color: '#666',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 4,
    },
    activeNavText: {
        color: '#007AFF',
    },
    
    // Colores de medicamentos
    paracetamol: {
        color: '#FF6B6B',
    },
    ibuprofeno: {
        color: '#4ECDC4',
    },
    naproxeno: {
        color: '#FFD166',
    },
    tempra: {
        color: '#118AB2',
    },
    
    // Scroll contents
    requestScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 10,
    },
});
