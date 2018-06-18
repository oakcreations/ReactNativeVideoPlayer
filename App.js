import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

import Video from 'react-native-video';
import Atrox from './atrox.mp4'

import Icon from "react-native-vector-icons/dist/FontAwesome";
import ProgressBar from "react-native-progress/Bar"

function secondsToTime(time){
  return ~~(time / 60) + ":" + (time % 60 < 10 ? "0": "") + time % 60;
}


export default class App extends React.Component {
  state = {
    buffering: true,
    animated: new Animated.Value(0),
    error: false,
    paused: false,
    progress: 0,
    duration: 0,
  }

  handleError = meta => {
    const { error: { code } } = meta;

    let error = "Ocorreu um erro ao executar o vídeo";
    
    switch (code) {
      case -11800:
        error = "Não foi possivel carregar o vídeo";
        break;
    }

    this.setState({
      buffering: false,
      error,
    });
  };

  handleLoad = meta => {
    meta.isBuffering && this.triggerBufferAnimation()

    if(this.loopingAnimation && !meta.isBuffering){
      this.loopingAnimation.stopAnimation();
    }
    console.log(meta.duration)
    this.setState({
      duration: meta.duration,
      buffering: meta.isBuffering
    })
  }

  handleLoadStart = () => {
    this.triggerBufferAnimation();
  }

  triggerBufferAnimation = () => {
    this.loopingAnimation = Animated.loop(
      Animated.timing(this.state.animated, {
        toValue: 1,
        duration: 500,
      })
    ).start();
  }

  handleMainButtonTouch = () => {
    console.log("XXXXXXXXXXxx")
    if (this.state.progress >= 1) {
      this.player.seek(0);
    }

    this.setState(state => {
      return {
        paused: !state.paused,
      };
    });
  };

  handleProgressPress = e => {
    const position = e.nativeEvent.locationX;
    const progress = (position / 250) * this.state.duration;
    const isPlaying = !this.state.paused;
    
    this.player.seek(progress);
  };

  handleProgress = progress => {
    this.setState({
      progress: progress.currentTime / this.state.duration,
    });
  };

  handleEnd = () => {
    this.setState({ paused: true });
  };

  render() {
    const { width } = Dimensions.get("window");
    const height = width * .5625;
    const { error, buffering } = this.state;
    // const videoUri = 'http://google.com/notavideo'
    const videoUri = 'http://184.72.239.149/vod/smil:BigBuckBunny.smil/playlist.m3u8'

    const interpolatedAnimation = this.state.animated.interpolate({
      inputRange: [0,1],
      outputRange: ["0deg", "360deg"]
    });

    const rotateStyle = {
      transform: [
        {rotate: interpolatedAnimation}
      ]
    }

    return (
      <View style={styles.container}>
        <View style={buffering || error  ? styles.blackBG : undefined}>
          <Video
            style={{ width: "100%", height }}
            source={{ uri: videoUri }}
            // source={Atrox}
            resizeMode="contain"
            ref={ref => {
              this.player = ref;
            }}
            paused={this.state.paused}
            onLoad={this.handleLoad}
            onLoadStart={this.handleLoadStart}
            onProgress={this.handleProgress}
            onEnd={this.handleEnd}
            onError={this.handleError}
          />
          <View style={styles.videoCover}>
            { buffering && <Animated.View style={rotateStyle}><Icon name="circle-o-notch" size={30} color="#FFF"/></Animated.View> }
            { error && <Icon name="exclamation-triangle" size={30} color="red" />}
            { error && <Text color="#FFF">{error}</Text>}
          </View>
          <View style={styles.controls}>
            <TouchableWithoutFeedback onPress={this.handleMainButtonTouch}>
              <Icon name={!this.state.paused ? "pause" : "play"} size={30} color="#FFF" />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={this.handleProgressPress}>
              <View>
                <ProgressBar
                  progress={this.state.progress}
                  color="#FFF"
                  unfilledColor="rgba(255,255,255,.5)"
                  borderColor="#FFF"
                  width={250}
                  height={20}
                />
              </View>
            </TouchableWithoutFeedback>
            <Text style={styles.duration}>
              {secondsToTime(Math.floor(this.state.progress * this.state.duration))}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  controls: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: 48,
    left: 0,
    bottom: 0,
    right: 0,
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  mainButton: {
    marginRight: 15,
  },
  duration: {
    color: "#FFF",
    marginLeft: 15,
  },
  videoCover: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  blackBG: {
    backgroundColor: "#000",
  },
});
