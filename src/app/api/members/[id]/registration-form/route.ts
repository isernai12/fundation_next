import { NextResponse } from "next/server";
import { getMember } from "@/features/members/actions";

function translateStatus(status: string) {
  switch (status) {
    case "ACTIVE": return "সক্রিয়";
    case "INACTIVE": return "নিষ্ক্রিয়";
    case "DELETED": return "বাতিল";
    default: return status;
  }
}

function formatBengaliDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date));
}

function formatBengaliNumber(num: string | number | null | undefined): string {
  if (num === null || num === undefined || num === '') return "";
  return num.toString().replace(/[0-9]/g, (match) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return bnNums[parseInt(match)];
  });
}

function escapeHtml(unsafe: string | null | undefined) {
  if (!unsafe) return "";
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const member = await getMember(resolvedParams.id);

  if (!member) {
    return new NextResponse("Member not found", { status: 404 });
  }

  const positionMap: Record<string, string> = {
    PRESIDENT: "সভাপতি",
    VICE_PRESIDENT: "সহ-সভাপতি",
    GENERAL_SECRETARY: "সাধারণ সম্পাদক",
    JOINT_SECRETARY: "যুগ্ম সম্পাদক",
    ORGANIZING_SECRETARY: "সাংগঠনিক সম্পাদক",
    TREASURER: "কোষাধ্যক্ষ",
    ADVISOR: "উপদেষ্টা",
    EXECUTIVE_MEMBER: "নির্বাহী সদস্য",
    GENERAL_MEMBER: "সাধারণ সদস্য"
  };
  const positionLabel = member.position ? (positionMap[member.position] || member.position) : "সাধারণ সদস্য";

  const getDoc = (title: string) => member.documents?.find((d: any) => d.title === title)?.secureUrl;
  const photoUrl = getDoc("Member Photo") || getDoc("Photo");

  let reference = { name: "", mobile: "", relation: "" };
  try {
    if (member.reference) reference = JSON.parse(member.reference);
  } catch(e) {}

  const photoBoxContent = photoUrl 
    ? `<div style="width: 90px; height: 110px;"><img src="${photoUrl}" alt="Member Photo" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" /></div>` 
    : `<div class="photo-box">সদস্যের<br>সাম্প্রতিক ছবি</div>`;

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>সদস্য প্রোফাইল ও নিবন্ধন ফর্ম</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">

<style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans Bengali', Arial, sans-serif; }
    body { background: #f3f4f6; padding: 20px; color: #1f2937; line-height: 1.4; }
    
    .paper {
        width: 210mm;
        min-height: 297mm;
        background: #fff;
        margin: 0 auto;
        padding: 10mm 15mm;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        overflow: hidden;
    }

    .print-btn { text-align: center; margin-bottom: 15px; }
    .print-btn button {
        background: #0f766e; color: #fff; border: none; padding: 10px 25px;
        border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: 600;
    }
    .print-btn button:hover { background: #115e59; }

    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 12px; }
    .logo { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
    .logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .title { flex: 1; text-align: center; padding: 0 15px; }
    .title h1 { font-size: 26px; color: #0f766e; font-weight: 700; margin-bottom: 2px; }
    .title h2 { font-size: 15px; color: #4b5563; font-weight: 600; margin-bottom: 4px; }
    .title p { font-size: 13px; color: #374151; }
    .slogan { font-size: 15px; font-weight: 700; color: #b45309; margin-top: 4px; font-style: italic; }
    .photo-box { width: 90px; height: 110px; border: 2px dashed #d1d5db; display: flex; justify-content: center; align-items: center; font-size: 12px; color: #6b7280; text-align: center; background: #f9fafb; border-radius: 4px; }

    .section-title {
        font-size: 15px;
        font-weight: 700;
        color: #0f766e;
        border-bottom: 1.5px solid #0f766e;
        padding-bottom: 4px;
        margin: 12px 0 6px; /* মার্জিন কিছুটা কমিয়ে আনা হয়েছে */
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .section-title::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        background: #0f766e;
        border-radius: 50%;
    }

    .data-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px 30px;
    }
    .data-grid.full-width {
        grid-template-columns: 1fr;
    }
    .data-item {
        display: flex;
        align-items: baseline;
        gap: 6px;
        padding: 3px 0;
    }
    .data-label {
        font-size: 13px;
        color: #374151;
        font-weight: 600;
        white-space: nowrap;
        min-width: fit-content;
    }
    .data-value {
        font-size: 13px;
        color: #111827;
        font-weight: 500;
        flex: 1;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .data-item.full {
        grid-column: 1 / -1;
    }

    .declaration-box {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-left: 4px solid #0f766e;
        padding: 10px 15px; /* প্যাডিং কমিয়ে আনা হয়েছে */
        margin-top: 10px;
        border-radius: 4px;
    }
    .declaration-text {
        font-size: 14px;
        color: #374151;
        line-height: 1.6;
        text-align: justify;
    }

    .footer {
        margin-top: 15px; /* মার্জিন কমিয়ে আনা হয়েছে */
        text-align: center;
        color: #9ca3af;
        font-size: 11px;
        border-top: 1px solid #e5e7eb;
        padding-top: 8px;
    }

    @media print {
        @page { 
            size: A4; 
            margin: 10mm 15mm; 
        }
        
        body { 
            background: #fff; 
            padding: 0; 
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .print-btn { 
            display: none !important; 
        }
        
        .paper { 
            width: 100% !important; 
            height: auto !important; 
            min-height: auto !important;
            box-shadow: none !important; 
            padding: 0 !important; 
            margin: 0 !important;
        }



        .data-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 7px 30px !important;
        }
        
        .data-item {
            padding: 4px 0 !important;
        }

        .section-title {
            margin-top: 18px !important;
            margin-bottom: 11px !important;
        }

        .declaration-box {
            padding: 11px 15px !important;
            margin-top: 13px !important;
        }

        .footer {
            margin-top: 21px !important;
            padding-top: 9px !important;
        }

        .header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding-bottom: 12px !important;
            margin-bottom: 14px !important;
        }

        /* Prevent page breaks */
        .header,
        .section-title,
        .data-grid,
        .declaration-box,
        .footer {
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .data-item {
            break-inside: avoid;
            page-break-inside: avoid;
        }

        /* Preserve colors and styles */
        .section-title { 
            color: #0f766e !important; 
            border-color: #0f766e !important;
        }
        
        .data-value { 
            border-bottom: 1px solid #e5e7eb !important;
        }
        
        .declaration-box { 
            background: #f9fafb !important; 
            border-left: 4px solid #0f766e !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* Preserve typography - সব টেক্সট এখন সমান ও সুসংহত */
        .data-label {
            font-size: 13px !important;
            white-space: nowrap !important;
        }

        .data-value {
            font-size: 13px !important;
            white-space: nowrap !important;
        }

        .title h1 { font-size: 26px !important; }
        .title h2 { font-size: 15px !important; }
        .title p { font-size: 13px !important; }
        .slogan { font-size: 15px !important; }
        .section-title { font-size: 15px !important; }
        .declaration-text { font-size: 14px !important; }
    }


</style>

</head>
<body>

<div class="print-btn">
    <button onclick="window.print()">🖨 ফর্ম প্রিন্ট করুন (A4)</button>
</div>

<div class="paper">

    <div class="header">
        <div class="logo">
            <img src="https://res.cloudinary.com/diwp8ug1r/image/upload/v1785393014/branding/o4r9o3gjgfkulrgm4bzu.png?v=1785394871157" alt="ভ্রাতিত্ব ফাউন্ডেশন লোগো">
        </div>
        <div class="title">
            <h1>ভ্রাতিত্ব ফাউন্ডেশন</h1>
            <h2><strong>Bhratritya Foundation</strong></h2>
            <p><strong>মঙ্গলেরগাঁও, সোনারগাঁও, নারায়ণগঞ্জ</strong></p>
            <p><strong>যোগাযোগ:</strong> ০১৯৬৩৯৫৩৬৮২, ০১৮৩৪০০৬০১৪</p>
            <p class="slogan">"মানবতার সেবায়, আল্লাহর সন্তুষ্টির জন্য"</p>
        </div>
        ${photoBoxContent}
    </div>



    <div class="section-title">ব্যক্তিগত তথ্য</div>
    <div class="data-grid">
        <div class="data-item">
            <span class="data-label">১. পুরো নাম:</span>
            <span class="data-value">${escapeHtml(member.fullName)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">২. পিতার নাম:</span>
            <span class="data-value">${escapeHtml(member.fatherName)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">৩. মাতার নাম:</span>
            <span class="data-value">${escapeHtml(member.motherName)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">৪. জন্ম তারিখ:</span>
            <span class="data-value">${escapeHtml(formatBengaliDate(member.dob))}</span>
        </div>
        <div class="data-item">
            <span class="data-label">৫. জাতীয় পরিচয়পত্র (NID):</span>
            <span class="data-value">${escapeHtml(formatBengaliNumber(member.nationalId))}</span>
        </div>
        <div class="data-item">
            <span class="data-label">৬. পেশা:</span>
            <span class="data-value">${escapeHtml(member.occupation)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">৭. শিক্ষাগত যোগ্যতা:</span>
            <span class="data-value">${escapeHtml(member.education)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">৮. রক্তের গ্রুপ:</span>
            <span class="data-value">${escapeHtml(member.bloodGroup)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">৯. বৈবাহিক অবস্থা:</span>
            <span class="data-value">${escapeHtml(member.maritalStatus)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">১০. মোবাইল নম্বর:</span>
            <span class="data-value">${escapeHtml(formatBengaliNumber(member.mobile))}</span>
        </div>
        <div class="data-item">
            <span class="data-label">১১. ইমেইল:</span>
            <span class="data-value">${escapeHtml(member.email)}</span>
        </div>
        <div class="data-item full">
            <span class="data-label">১২. বর্তমান ঠিকানা:</span>
            <span class="data-value">${escapeHtml(member.presentAddress)}</span>
        </div>
        <div class="data-item full">
            <span class="data-label">১৩. স্থায়ী ঠিকানা:</span>
            <span class="data-value">${escapeHtml(member.permanentAddress)}</span>
        </div>
    </div>

    <div class="section-title">জরুরি যোগাযোগ</div>
    <div class="data-grid">
        <div class="data-item">
            <span class="data-label">১৪. নাম:</span>
            <span class="data-value">${escapeHtml(member.emergencyContactName)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">১৫. সম্পর্ক:</span>
            <span class="data-value">${escapeHtml(member.emergencyContactRelation)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">১৬. মোবাইল নম্বর:</span>
            <span class="data-value">${escapeHtml(formatBengaliNumber(member.emergencyContactMobile))}</span>
        </div>
    </div>

    <div class="section-title">রেফারেন্স</div>
    <div class="data-grid">
        <div class="data-item">
            <span class="data-label">১৭. নাম:</span>
            <span class="data-value">${escapeHtml(reference.name)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">১৮. সম্পর্ক:</span>
            <span class="data-value">${escapeHtml(reference.relation)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">১৯. মোবাইল নম্বর:</span>
            <span class="data-value">${escapeHtml(formatBengaliNumber(reference.mobile))}</span>
        </div>
    </div>

    <div class="section-title">ঘোষণা</div>
    <div class="declaration-box">
        <p class="declaration-text">
            আমি ঘোষণা করছি যে, আমি ভ্রাতৃত্ব ফাউন্ডেশনের উদ্দেশ্য, নীতি ও নিয়ম-কানুন মেনে চলব এবং মানবসেবামূলক সকল কার্যক্রমে সততা, দায়িত্বশীলতা ও নিষ্ঠার সাথে অংশগ্রহণ করব।
        </p>
    </div>

    <div class="section-title">সদস্যপদ তথ্য</div>
    <div class="data-grid">
        <div class="data-item">
            <span class="data-label">২০. সদস্য আইডি:</span>
            <span class="data-value">${escapeHtml(member.memberId)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">২১. গ্রুপ:</span>
            <span class="data-value">${escapeHtml(member.group?.name)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">২২. গ্রুপ কোড:</span>
            <span class="data-value">${escapeHtml(member.group?.code)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">২৩. যোগদানের তারিখ:</span>
            <span class="data-value">${escapeHtml(formatBengaliDate(member.joinDate))}</span>
        </div>
        <div class="data-item">
            <span class="data-label">২৪. সদস্যের পদ:</span>
            <span class="data-value">${escapeHtml(positionLabel)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">২৫. বর্তমান অবস্থা:</span>
            <span class="data-value">${escapeHtml(translateStatus(member.status))}</span>
        </div>
    </div>

    <div class="footer">
        এটি একটি কম্পিউটার জেনারেটেড সদস্য প্রোফাইল ও নিবন্ধন ফর্ম।
    </div>

</div>

</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
