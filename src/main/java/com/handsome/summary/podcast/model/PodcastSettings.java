package com.handsome.summary.podcast.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.ToString;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PodcastSettings {
    public static final String GROUP = "podcast";
    private Boolean enabled = false;
    private Boolean enableUiInjection = true;
    private String scriptModelName;
    private Integer durationMinutes = 2;
    private String style = "casual";
    private String introText = "";
    private String outroText = "";
    private String provider = "bailian";
    private String policyName;
    private String groupName;
    private VoiceService bailian = new VoiceService("cosyvoice-v3-flash", "longanyang", "longanhuan");
    private VoiceService cosyvoice = new VoiceService("cosyvoice-v3-flash", "longanyang", "longanhuan");
    private VoiceService bailianMinimax = new VoiceService("MiniMax/speech-2.8-turbo", "male-qn-qingse", "female-shaonv");
    private VoiceService minimax = new VoiceService("speech-2.8-turbo", "male-qn-qingse", "female-shaonv");
    private VoiceService doubao = new VoiceService("podcast", "zh_male_dayixiansheng_v2_saturn_bigtts", "zh_female_mizaitongxue_v2_saturn_bigtts");

    public VoiceService voiceService() {
        return switch (provider == null ? "" : provider) {
            case "bailian" -> bailian;
            case "bailian-cosyvoice" -> cosyvoice;
            case "bailian-minimax" -> bailianMinimax;
            case "minimax" -> minimax;
            case "doubao" -> doubao;
            default -> throw new IllegalArgumentException("不支持的语音服务");
        };
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VoiceService {
        @ToString.Exclude
        private String apiKey;
        private String workspaceId;
        private String model;
        private String voiceA;
        private String voiceB;
        private String instruction = "";
        private String emotion = "";
        private String language = "";
        private Boolean autoEmotion = false;
        private Integer speechRate = 0;
        private Boolean useHeadMusic = false;
        private Boolean useTailMusic = false;

        public VoiceService() { }

        public VoiceService(String model, String voiceA, String voiceB) {
            this.model = model;
            this.voiceA = voiceA;
            this.voiceB = voiceB;
        }
    }
}
