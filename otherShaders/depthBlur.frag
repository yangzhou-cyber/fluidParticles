precision highp float;

uniform sampler2D u_texture;
varying vec2 v_coordinates;
uniform float filterRadius;
uniform vec2 u_textureSize;

const float blurScale = 0.05;
const float blurDepthFalloff = 500.0;

void main(){
    // gets size of single texel.
    vec2 tex_offset = 1.0 / u_textureSize;

    float sum = 0.0;
    float wsum = 0.0;
    float value = texture2D(u_texture, v_coordinates).r;

    for(int y = -1; y <= 1; y += 1){
        for(int x = -1; x <= 1; x += 1){

            float sampler = texture2D(u_texture, v_coordinates + vec2(x, y) * tex_offset).r;

            // spatial domain.
            float r = length(vec2(x, y)) * blurScale;
            float w = exp(-r * r);

            // range domain.
            float r2 = (sampler - value) * blurDepthFalloff;
            float g = exp(-r2 * r2);

            sum += sampler * w * g;
            wsum += w * g;
        }
    }

    if(wsum >= 0.0)
    sum /= wsum;

    gl_FragColor = vec4(sum, sum, sum, 1.0);
}

