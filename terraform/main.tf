terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.41.0"  # Latest compatible with Free Tier
    }
  }
  required_version = ">= 1.5.0"  # Minimum stable version
}

provider "aws" {
  region = "us-east-1"  # Most Free Tier-eligible region
}

data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "free_tier_sg" {
  name        = "free-tier-sg"
  description = "Free Tier security group"

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP Access"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    CostCenter = "FreeTier"
  }
}

resource "aws_instance" "free_tier_ec2" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = "t3.micro"  # Free Tier eligible
  key_name               = "chat-app-key"
  vpc_security_group_ids = [aws_security_group.free_tier_sg.id]

  tags = {
    Name      = "FreeTier-EC2"
    ManagedBy = "Terraform"
  }

  # Explicitly set to meet Free Tier requirements
  root_block_device {
    volume_type = "gp2"
    volume_size = 8  # GB (Free Tier allows up to 30GB)
  }
}

output "instance_public_ip" {
  value = aws_instance.free_tier_ec2.public_ip
}

output "instance_public_dns" {
  value = aws_instance.free_tier_ec2.public_dns
}
