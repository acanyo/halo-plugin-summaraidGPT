package com.handsome.summary.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Setter;
import lombok.experimental.Accessors;
import java.time.LocalDateTime;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@Accessors(chain = true)
public class TokenData {

    @JsonProperty("access_token")
    private String accessToken; //访问凭证

    @JsonProperty("expires_in")
    private int expiresIn; //有效期，Access Token的有效期。说明：单位是秒，有效期30天

    @JsonProperty("error")
    private String error; //错误码

    @JsonProperty("error_description")
    private String errorDescription; //错误描述信息

    @Setter
    private long tokenTimestamp; // 新增字段记录获取时间

    public Boolean isExpired() {
        long currentTimestamp = System.currentTimeMillis();
        // 提前5分钟（300秒）认为过期
        long safetyMargin = 300 * 1000; // 转为毫秒
       return currentTimestamp >= (expiresIn = Math.toIntExact(expiresIn * 1000L - safetyMargin));
    }

}
