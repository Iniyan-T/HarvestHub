import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeCropImage = async (imagePath) => {
  try {
    console.log('🔍 Starting Gemini Vision analysis...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Read and convert image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const prompt = `Analyze this crop/produce image and provide a quality grade based on STRICT visual standards.

GRADING STANDARDS (FOLLOW STRICTLY):

Grade A:
- Fresh appearance
- Uniform natural color
- No visible damage, rot, mold, or insect marks
- Suitable for premium market sale

Grade B:
- Minor color variation
- Small surface defects
- Slight bruises or shape irregularity
- Suitable for normal wholesale markets

Grade C:
- Visible damage, rot, black spots, cracks, mold, or pest attack
- Poor freshness
- Not suitable for premium selling

INSTRUCTIONS:
1. Carefully observe color, texture, freshness, and visible defects
2. Do not guess crop type unless clearly visible
3. If image quality is unclear, mention it in analysis
4. Base your decision STRICTLY on visible visual indicators
5. Do NOT include disclaimers or safety messages
6. Do NOT explain the grading process

Return output STRICTLY in this JSON format (no additional text, no markdown):

{
  "grade": "A/B/C",
  "confidence": <number 0-100>,
  "qualityScore": <number 0-100>,
  "defects": ["list of specific visible defects, empty array if none"],
  "freshness": "Excellent/Good/Fair/Poor",
  "analysis": "Brief objective description of visual observations only"
}

Rules:
- confidence: How confident you are in the grading (based on image clarity and visibility)
- qualityScore: Overall quality (A=85-100, B=60-84, C=0-59)
- defects: List ONLY what you actually SEE (e.g., "brown spots", "surface bruising", "mold patches")
- freshness: Based on visual indicators like color vibrancy, wilting, moisture
- analysis: 1-2 sentences describing what you observe, no explanations or recommendations

OUTPUT JSON ONLY:`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      },
      prompt
    ]);

    const response = await result.response;
    let text = response.text().trim();
    
    console.log('📝 Raw Gemini response:', text);
    
    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️ Could not parse JSON, using fallback');
      return createFallbackGrade();
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Strict validation according to grading standards
    let validatedGrade = analysis.grade;
    if (!['A', 'B', 'C'].includes(validatedGrade)) {
      // Auto-correct based on quality score
      const score = analysis.qualityScore || 70;
      if (score >= 85) validatedGrade = 'A';
      else if (score >= 60) validatedGrade = 'B';
      else validatedGrade = 'C';
    }
    
    // Validate quality score matches grade
    let validatedScore = analysis.qualityScore || 70;
    if (validatedGrade === 'A' && validatedScore < 85) {
      validatedScore = 85;
    } else if (validatedGrade === 'B' && (validatedScore < 60 || validatedScore >= 85)) {
      validatedScore = 70;
    } else if (validatedGrade === 'C' && validatedScore >= 60) {
      validatedScore = 50;
    }
    
    const aiGrade = {
      grade: validatedGrade,
      confidence: Math.min(100, Math.max(0, analysis.confidence || 75)),
      qualityScore: validatedScore,
      defects: Array.isArray(analysis.defects) ? analysis.defects : [],
      freshness: validateFreshness(analysis.freshness),
      analysis: analysis.analysis || 'Visual assessment completed',
      analyzedAt: new Date()
    };
    
    console.log('✅ Validated AI Grade:', aiGrade);
    
    return aiGrade;
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    console.error('Full error:', error);
    
    // Return fallback grade if API fails
    return createFallbackGrade();
  }
};

// Helper function to validate freshness
function validateFreshness(freshness) {
  const validFreshness = ['Excellent', 'Good', 'Fair', 'Poor'];
  return validFreshness.includes(freshness) ? freshness : 'Good';
}

// Fallback grade when API fails
function createFallbackGrade() {
  return {
    grade: 'B',
    confidence: 60,
    qualityScore: 70,
    defects: ['Image analysis unavailable - manual inspection required'],
    freshness: 'Good',
    analysis: 'Automated grading system temporarily unavailable. Please ensure good image quality and try again.',
    analyzedAt: new Date()
  };
}
