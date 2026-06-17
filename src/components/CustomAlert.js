import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, radius, spacing, typography, shadow } from '../theme/theme';

export const alertEmitter = {
  listeners: [],
  toastListeners: [],
  alert: (title, message, buttons) => {
    alertEmitter.listeners.forEach(listener => listener(title, message, buttons));
  },
  toast: (message, duration = 3000) => {
    alertEmitter.toastListeners.forEach(listener => listener(message, duration));
  },
  subscribe: (listener) => {
    alertEmitter.listeners.push(listener);
    return () => {
      alertEmitter.listeners = alertEmitter.listeners.filter(l => l !== listener);
    };
  },
  subscribeToast: (listener) => {
    alertEmitter.toastListeners.push(listener);
    return () => {
      alertEmitter.toastListeners = alertEmitter.toastListeners.filter(l => l !== listener);
    };
  }
};

export const Toast = {
  show: (message, duration) => {
    alertEmitter.toast(message, duration);
  }
};

// Sobrescrevendo o Alert.alert padrão globalmente
const originalAlert = Alert.alert;
Alert.alert = (title, message, buttons, options) => {
  let msgString = message;
  
  // Ocultar a mensagem "[object Object]" indesejada ou objetos mal formados
  if (typeof message === 'object') {
     msgString = 'Ocorreu um erro inesperado.';
  } else if (String(message).includes('[object Object]')) {
     msgString = 'Ocorreu um erro inesperado.';
  } else if (!message || message === 'undefined') {
     msgString = '';
  }

  // Se não houver botões definidos, colocamos um botão de OK padrão
  const btns = buttons || [{ text: 'OK', onPress: () => {} }];
  
  alertEmitter.alert(title, msgString, btns);
};

export default function GlobalAlert() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({ title: '', message: '', buttons: [] });

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const unsubscribe = alertEmitter.subscribe((title, message, buttons) => {
      setConfig({ title, message, buttons });
      setVisible(true);
    });
    
    let toastTimer;
    const unsubToast = alertEmitter.subscribeToast((message, duration) => {
      setToastMessage(message);
      setToastVisible(true);
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        setToastVisible(false);
      }, duration);
    });

    return () => {
      unsubscribe();
      unsubToast();
      clearTimeout(toastTimer);
    };
  }, []);

  const close = () => setVisible(false);

  return (
    <>
      <Modal transparent animationType="fade" visible={visible} onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            {!!config.title && <Text style={styles.title}>{config.title}</Text>}
            {!!config.message && <Text style={styles.message}>{config.message}</Text>}
            
            <View style={styles.buttonRow}>
              {config.buttons.map((btn, index) => {
                const isCancel = btn.style === 'cancel' || btn.style === 'destructive';
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.button, isCancel ? styles.buttonOutline : styles.buttonPrimary, config.buttons.length > 2 && { width: '100%', marginBottom: 8 }]} 
                    onPress={() => {
                      close();
                      if (btn.onPress) btn.onPress();
                    }}
                  >
                    <Text style={[styles.buttonText, isCancel ? styles.buttonTextOutline : styles.buttonTextPrimary]}>
                      {btn.text || 'OK'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {toastVisible && (
        <View style={styles.toastContainer} pointerEvents="none">
          <View style={styles.toastBox}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  alertBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadow.card,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    minWidth: 100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonOutline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonTextPrimary: {
    color: colors.textInverse,
  },
  buttonTextOutline: {
    color: colors.textPrimary,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  toastBox: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    maxWidth: '80%',
    ...shadow.card,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  }
});
