import Image from 'next/image';

export default function ExplainerSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 bg-accent">
      <h2 className="text-4xl font-bold text-center mb-16 text-accent-foreground">How Auto Creatives Works</h2>

      <div className="space-y-24">
        {/* Step 1: Input your brand details */}
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-primary bg-background border-2 border-primary rounded-full w-12 h-12 flex items-center justify-center">
                1
              </div>
              <h3 className="text-2xl font-semibold text-accent-foreground">Input your brand details</h3>
            </div>
            <p className="text-lg text-muted-foreground">
              Provide information about your brand, product, or service. Include key features, target audience, and desired ad style to guide our AI in creating the perfect ad for you.
            </p>
          </div>
          <div className="md:w-1/2 bg-card p-6 rounded-lg shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-primary"></div>
                <span className="text-card-foreground">Brand Name: Chocolate Delight</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-secondary"></div>
                <span className="text-card-foreground">Product: Artisanal Dark Chocolate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-accent"></div>
                <span className="text-card-foreground">Target: Chocolate enthusiasts, 25-45</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-muted"></div>
                <span className="text-card-foreground">Style: Luxurious and indulgent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: AI generates concepts */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-primary bg-background border-2 border-primary rounded-full w-12 h-12 flex items-center justify-center">
                2
              </div>
              <h3 className="text-2xl font-semibold text-accent-foreground">AI generates concepts</h3>
            </div>
            <p className="text-lg text-muted-foreground">
              Our advanced AI analyzes your input and generates multiple creative concepts for your ad. This process takes just a few minutes, producing unique and tailored designs.
            </p>
          </div>
          <div className="md:w-1/2 relative h-96">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/ad_2_chocolate_brand_demo.png"
                alt="AI generated chocolate ad concept 1"
                width={300}
                height={300}
                className="rounded-lg shadow-lg transform -rotate-3 z-10"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/ad_0_chocolate_brand_demo.png"
                alt="AI generated chocolate ad concept 2"
                width={280}
                height={280}
                className="rounded-lg shadow-lg transform translate-x-16 translate-y-16 rotate-3 z-20"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Review and select */}
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-primary bg-background border-2 border-primary rounded-full w-12 h-12 flex items-center justify-center">
                3
              </div>
              <h3 className="text-2xl font-semibold text-accent-foreground">Review and select</h3>
            </div>
            <p className="text-lg text-muted-foreground">
              Review the generated ad creatives and select your favorites. You can request refinements or generate new variations until you find the perfect ad for your campaign.
            </p>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            <Image
              src="/ad_0_chocolate_brand_demo.png"
              alt="Final chocolate ad 1"
              width={300}
              height={300}
              className="rounded-lg shadow-lg"
            />
            <Image
              src="/ad_1_chocolate_brand_demo.png"
              alt="Final chocolate ad 2"
              width={300}
              height={300}
              className="rounded-lg shadow-lg"
            />
            <Image
              src="/ad_2_chocolate_brand_demo.png"
              alt="Final chocolate ad 3"
              width={300}
              height={300}
              className="rounded-lg shadow-lg"
            />
            <div className="bg-card rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-4xl text-card-foreground">+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}