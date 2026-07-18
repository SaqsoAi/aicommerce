import prisma from "../config/prisma";

type ProfileFieldSeed = {
  name: string;
  label: string;
  type: string;
};

const fields: ProfileFieldSeed[] = [
  { name: "profilePhoto", label: "Profile Photo", type: "URL" },
  { name: "firstName", label: "First Name", type: "TEXT" },
  { name: "lastName", label: "Last Name", type: "TEXT" },

  { name: "dateOfBirth", label: "Date Of Birth", type: "DATE" },
  { name: "gender", label: "Gender", type: "SELECT" },

  { name: "phone", label: "Phone", type: "PHONE" },
  { name: "alternatePhone", label: "Alternate Phone", type: "PHONE" },

  { name: "country", label: "Country", type: "TEXT" },
  { name: "state", label: "State", type: "TEXT" },
  { name: "city", label: "City", type: "TEXT" },
  { name: "postalCode", label: "Postal Code", type: "TEXT" },

  { name: "addressLine1", label: "Address Line 1", type: "TEXT" },
  { name: "addressLine2", label: "Address Line 2", type: "TEXT" },

  { name: "facebook", label: "Facebook", type: "URL" },
  { name: "instagram", label: "Instagram", type: "URL" },
  { name: "linkedin", label: "LinkedIn", type: "URL" },
  { name: "youtube", label: "YouTube", type: "URL" },
  { name: "tiktok", label: "TikTok", type: "URL" },
  { name: "website", label: "Website", type: "URL" },

  { name: "preferredLanguage", label: "Language", type: "SELECT" },
  { name: "preferredCurrency", label: "Currency", type: "SELECT" },
  { name: "themeMode", label: "Theme Mode", type: "SELECT" },
];

async function main() {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];

    if (!field) continue;

    const exists =
      await prisma.customerProfileField.findFirst({
        where: {
          name: field.name,
        },
      });

    if (exists) {
      console.log("EXISTS:", field.name);
      continue;
    }

    await prisma.customerProfileField.create({
      data: {
        name: field.name,
        label: field.label,
        type: field.type,
        isSystem: true,
        enabled: true,
        visible: true,
        required: false,
        sortOrder: i + 1,
      },
    });

    console.log("CREATED:", field.name);
  }

  console.log("Customer Profile Fields Seeded");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
