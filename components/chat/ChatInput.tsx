import SendIcon from "@/assets/images/chat/send.svg";
import { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, TextInput, View } from 'react-native';

interface ChatInputProps {
  themeId?: number;
}

const ChatInput = ({ themeId = 1 }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // 테마에 따른 색상 설정
  const borderColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";

  const handleSend = () => {
    if (message.trim()) {
      console.log('메시지 전송:', message);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { borderColor }]}
          placeholder="메시지 입력"
          placeholderTextColor="#BBBBBB"
          value={message}
          onChangeText={setMessage}
          multiline={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {(isFocused || message.length > 0) && (
          <Pressable 
            style={styles.sendButton} 
            onPress={handleSend}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <SendIcon width={24} height={24} color={borderColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default ChatInput; 

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    height: '100%',
    justifyContent: 'center',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    height: 40,
  },
  input: {
    width: '100%',
    height: 40,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F9BCC1',
    paddingHorizontal: 20,
    paddingRight: 48, // 아이콘 공간 확보
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: '#3b3b3b',
  },
  sendButton: {
    position: 'absolute',
    right: 12,
    top: 8,
    zIndex: 1,
  },
});